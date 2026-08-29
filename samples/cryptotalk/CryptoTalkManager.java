package com.cryptotalk.security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.KeyPairGenerator;
import java.security.KeyPair;
import java.security.SecureRandom;
import javax.crypto.KeyAgreement;

/**
 * CryptoTalk Reference Secure Communications Engine
 * Demonstrates modern cryptographic hygiene for end-to-end encryption.
 */
public class CryptoTalkManager {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;
    private static final int KEY_SIZE = 256;

    public byte[] encryptMessage(byte[] plaintext, SecretKey key) throws Exception {
        byte[] iv = new byte[GCM_IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);

        byte[] ciphertext = cipher.doFinal(plaintext);
        return ciphertext;
    }

    public KeyPair generateECDHKeyPair() throws Exception {
        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("EC");
        keyPairGen.initialize(256);
        return keyPairGen.generateKeyPair();
    }

    public KeyAgreement initKeyAgreement() throws Exception {
        KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");
        return keyAgreement;
    }

    public byte[] calculateFingerprint(byte[] publicKeyBytes) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return digest.digest(publicKeyBytes);
    }

    public KeyStore getHardwareKeyStore() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        return keyStore;
    }
}
