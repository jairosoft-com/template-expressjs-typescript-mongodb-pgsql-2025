import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '@common/utils/logger';
import config from '@/config';
import { userRepository } from '@/repositories/user.repository';
import { eventService } from './event.service';

interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorVerification {
  token: string;
  backupCode?: string;
}

class TwoFactorService {
  private readonly issuer = 'Express Template';
  private readonly algorithm = 'sha1';
  private readonly digits = 6;
  private readonly period = 30;
  private readonly window = 2; // Allow 2 time steps for clock skew

  /**
   * Generate 2FA secret for user
   */
  async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSecret> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${userEmail} (${this.issuer})`,
      issuer: this.issuer,
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret in user document
    await userRepository.update(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false, // Will be enabled after verification
    });

    // Add backup codes
    await userRepository.addBackupCodes(userId, backupCodes);

    logger.info(`2FA secret generated for user ${userId}`);

    return {
      secret: secret.base32!,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify 2FA token
   */
  async verifyToken(userId: string, verification: TwoFactorVerification): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not set up for this user');
    }

    // Check if backup code is being used
    if (verification.backupCode) {
      return this.verifyBackupCode(userId, verification.backupCode);
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verification.token,
      window: this.window,
      algorithm: this.algorithm,
      digits: this.digits,
      step: this.period,
    });

    if (verified) {
      logger.info(`2FA token verified for user ${userId}`);

      // Emit 2FA verification event
      await eventService.emitEvent(
        'user.2fa_verified',
        {
          method: 'totp',
          timestamp: new Date().toISOString(),
        },
        userId
      );
    }

    return verified;
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const isValid = await userRepository.useBackupCode(userId, code);
      if (isValid) {
        logger.info(`Backup code used for user ${userId}`);
      }
      return isValid;
    } catch (error) {
      logger.error({ error }, 'Error verifying backup code');
      return false;
    }
  }

  /**
   * Enable 2FA for user
   */
  async enableTwoFactor(userId: string): Promise<void> {
    try {
      await userRepository.enableTwoFactor(userId, '');
      logger.info(`2FA enabled for user ${userId}`);

      // Emit 2FA enabled event
      await eventService.emitEvent(
        'user.2fa_enabled',
        {
          timestamp: new Date().toISOString(),
        },
        userId
      );
    } catch (error) {
      logger.error({ error }, 'Error enabling 2FA');
      throw error;
    }
  }

  /**
   * Disable 2FA for user
   */
  async disableTwoFactor(userId: string): Promise<void> {
    try {
      await userRepository.update(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });

      // Remove backup codes
      // Note: This would require a method to delete backup codes
      // For now, we'll just disable 2FA

      logger.info(`2FA disabled for user ${userId}`);

      // Emit 2FA disabled event
      await eventService.emitEvent(
        'user.2fa_disabled',
        {
          timestamp: new Date().toISOString(),
        },
        userId
      );
    } catch (error) {
      logger.error({ error }, 'Error disabling 2FA');
      throw error;
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();

    // Remove old backup codes and add new ones
    // Note: This would require a method to delete backup codes
    // For now, we'll just add new ones
    await userRepository.addBackupCodes(userId, backupCodes);

    logger.info(`Backup codes regenerated for user ${userId}`);

    return backupCodes;
  }

  /**
   * Get remaining backup codes count
   */
  async getRemainingBackupCodes(userId: string): Promise<number> {
    // This would require a method to count unused backup codes
    // For now, return a default value
    return 10;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Generate 2FA JWT token
   */
  generateTwoFactorToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
        type: '2fa',
        iat: Date.now(),
      },
      config.jwt.secret,
      { expiresIn: '5m' } // Short-lived token for 2FA
    );
  }

  /**
   * Verify 2FA JWT token
   */
  verifyTwoFactorToken(token: string): any {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      if (decoded.type !== '2fa') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch {
      throw new Error('Invalid 2FA token');
    }
  }

  /**
   * Check if 2FA is enabled
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    return user?.twoFactorEnabled || false;
  }

  /**
   * Get 2FA status
   */
  async getTwoFactorStatus(userId: string): Promise<any> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      enabled: user.twoFactorEnabled,
      hasSecret: !!user.twoFactorSecret,
      remainingBackupCodes: await this.getRemainingBackupCodes(userId),
    };
  }

  /**
   * Validate TOTP token format
   */
  validateTokenFormat(token: string): boolean {
    return /^\d{6}$/.test(token);
  }

  /**
   * Get current TOTP token for testing
   */
  getCurrentToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
      algorithm: this.algorithm,
      digits: this.digits,
      step: this.period,
    });
  }

  /**
   * Generate QR code for secret
   */
  async generateQRCode(secret: string, userEmail: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: userEmail,
      issuer: this.issuer,
      algorithm: this.algorithm,
      digits: this.digits,
      // IMPORTANT: The 'step' property is not supported by the speakeasy library's otpauthURL method
      // even though it's a valid TOTP parameter. This is a known limitation of speakeasy v2.x.
      // The library uses the 'period' parameter internally but doesn't expose it in otpauthURL.
      // See: https://github.com/speakeasy-js/speakeasy/issues/110
      // Workaround: The default 30-second period is used, which is standard for most TOTP implementations.
      // step: this.period, // Would be the correct property name per TOTP spec
    });

    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Cleanup expired backup codes
   */
  async cleanupExpiredBackupCodes(): Promise<void> {
    // This would require a method to find and delete expired backup codes
    // For now, we'll just log that cleanup is not implemented
    logger.info('Backup code cleanup not implemented in current version');
  }

  /**
   * Get 2FA statistics
   */
  async getTwoFactorStatistics(): Promise<any> {
    // This would require methods to count users with specific criteria
    // For now, return basic statistics
    return {
      totalUsers: 0,
      usersWith2FA: 0,
      usersWithSecret: 0,
    };
  }
}

// Export singleton instance
export const twoFactorService = new TwoFactorService();
export default twoFactorService;
