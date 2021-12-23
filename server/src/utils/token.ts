import jwt, { verify } from "jsonwebtoken";
import Token from "../models/Token";

class TokenService {
  async generateToken(payload: any) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET!, {
      expiresIn: "15s",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, {
      expiresIn: "30d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  validateAccessToken(token: any) {
    try {
      const userData = verify(token, process.env.ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
  validateRefreshToken(token: any) {
    try {
      const userData = verify(token, process.env.REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
  async saveToken(userId: string | number, refreshToken: string) {
    const token = await Token.findOne({ user: userId });
    if (token) {
      token.refreshToken = refreshToken;
      return token.save();
    }
    const tokenData = await Token.create({ user: userId, refreshToken });
    return token;
  }
  async removeToken(refreshToken: string) {
    const tokenData = await Token.deleteOne({ refreshToken });
    return tokenData;
  }
  async findToken(refreshToken: string) {
    const tokenData = await Token.findOne({ refreshToken });
    return tokenData;
  }
}
export default new TokenService();
