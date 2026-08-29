import hashlib
from Crypto.Cipher import AES

def hash_user_password(password: str) -> str:
    # Vulnerable: Insecure MD5
    return hashlib.md5(password.encode()).hexdigest()

def legacy_token_sign(data: bytes) -> bytes:
    # Vulnerable: SHA1
    return hashlib.sha1(data).digest()

def encrypt_payload(data: bytes, key: bytes):
    # Vulnerable: AES in ECB mode
    cipher = AES.new(key, AES.MODE_ECB)
    return cipher.encrypt(data)
