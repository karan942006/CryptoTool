package com.legacybanking.core;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;

/**
 * Legacy Banking Core Processing Engine (Legacy Cryptographic Implementation)
 * Contains known vulnerable/deprecated algorithms for testing detection capabilities.
 */
public class LegacyTransactionHandler {

    // Vulnerable: ECB Mode
    public byte[] encryptAccountData(byte[] data, byte[] keyBytes) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        return cipher.doFinal(data);
    }

    // Vulnerable: Triple-DES
    public byte[] encryptCardPIN(byte[] pin, byte[] desKey) throws Exception {
        Cipher desCipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        return desCipher.doFinal(pin);
    }

    // Vulnerable: 1024-bit RSA
    public void generateLegacyTransportKey() throws Exception {
        KeyPairGenerator rsaGen = KeyPairGenerator.getInstance("RSA");
        rsaGen.initialize(1024);
        rsaGen.generateKeyPair();
    }

    // Vulnerable: SHA-1 for signature
    public byte[] signAuditLog(byte[] log) throws Exception {
        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        return sha1.digest(log);
    }

    // Vulnerable: MD5 checksum
    public byte[] computeCheckSum(byte[] payload) throws Exception {
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        return md5.digest(payload);
    }
}
