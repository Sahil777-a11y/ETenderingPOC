// @ts-expect-error: There is no type declaration for 'crypto-js'
import CryptoJS from "crypto-js";

const base64ToUrlSafe = (b64: string): string =>
  b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const secretKey = import.meta.env.VITE_SECRET_KEY;

export const encryptForUrl = (plainText: string) => {
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(secretKey), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
  const cipherBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  const token = base64ToUrlSafe(ivBase64) + "." + base64ToUrlSafe(cipherBase64);
  return token;
};
