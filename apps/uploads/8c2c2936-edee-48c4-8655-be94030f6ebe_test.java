import javax.crypto.Cipher;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import javax.net.ssl.SSLContext;

public class CryptoTest {

    public static void main(String[] args) throws Exception {

        Cipher cipher1 =
                Cipher.getInstance("AES/GCM/NoPadding");

        Cipher cipher2 =
                Cipher.getInstance("AES/ECB/PKCS5Padding");

        KeyPairGenerator rsa =
                KeyPairGenerator.getInstance("RSA");

        MessageDigest sha1 =
                MessageDigest.getInstance("SHA-1");

        MessageDigest sha256 =
                MessageDigest.getInstance("SHA-256");

        SSLContext tls =
                SSLContext.getInstance("TLSv1.2");

        System.out.println("Test application");
    }
}