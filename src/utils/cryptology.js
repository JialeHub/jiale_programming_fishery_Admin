import JSEncrypt from 'jsencrypt/bin/jsencrypt'

//公钥
let publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7BwAwHQkvyiwpRI4oueZ\n" +
  "xb9/i0LpPdNiTMP4JgL1rHIGAYH7/iRbD4bCLtR3I/Lb5jMZ9KLl2QiL+g30RBav\n" +
  "EdgaVqcbbhRBBJW3cKklxG4G1+WchbIWnRNtbNPE4x2oebqmowocoksstCvQsKgB\n" +
  "sUAzPM+DFKlsgICAGS2vrgWpjSgkh7DaVMbOdFF1DMzdFFl5hctqZChISF3GBa6t\n" +
  "HzvmCTyQ7NwpVyfvt3yA3o9G5Fpnf4PfRh1I7+ORz5AuO+59zp2FWbnchwmj6SJw\n" +
  "a5myBMFPCqOPLibpLhLYEwOwuifyuSH08c3yQCnJxE+cw5M2KPblL8EU/kT56rZb\n" +
  "1wIDAQAB"

/**
 * @description 加密
 * */
export const RSAEncrypt = txt => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey); // 设置公钥
  return encrypt.encrypt(txt) // 对需要加密的数据进行加密
};
