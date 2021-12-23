import { compare, hash } from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/User";
import { v4 as uuid } from "uuid";
import mail from "../utils/mail";
import token from "../utils/token";
import UserDto from "../dto/user";
import ApiError from "../middleware";
import { validationResult } from "express-validator";

class UserController {
  async registration(req: Request, res: Response, next: any) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        throw ApiError.BadRequest(
          `Пользователь с почтовым адресом ${email} уже существует`
        );
      }
      const hashedPass = await hash(password, 12);
      const activationLink: string = uuid();
      const user = new User({
        email,
        password: hashedPass,
        activationLink,
      });
      await user.save();
      await mail.sendActivationMail(
        email,
        `http://localhost:4000/activate/${activationLink}`
      );
      const userDto = new UserDto(user);
      const tokens = await token.generateToken({ ...userDto });
      await token.saveToken(userDto.id, tokens.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json({
        user,
      });
    } catch (e) {
      next(e);
    }
  }
  async login(req: Request, res: Response, next: any) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw ApiError.BadRequest("Пользователь с таким email не авторизован");
      }
      const isPassEquals = await compare(password, user.password);
      if (!isPassEquals) {
        throw ApiError.BadRequest("Неверный пароль");
      }
      const userDto = new UserDto(user);
      const tokens = await token.generateToken({ ...userDto });
      token.saveToken(userDto.id, tokens.refreshToken);
      await token.saveToken(userDto.id, tokens.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json({
        user,
        ...tokens,
      });
    } catch (e) {
      next(e);
    }
  }
  async logout(req: Request, res: Response, next: any) {
    try {
      const { refreshToken } = req.cookies;
      await token.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      return res.json("success");
    } catch (e) {
      next(e);
    }
  }
  async activate(req: Request, res: Response, next: any) {
    try {
      const activationLink = req.params.link;
      const user = await User.findOne({ activationLink });
      if (!user) {
        throw ApiError.BadRequest("Некоректная ссылка активации");
      }
      user.isActivated = true;
      await user.save();
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }
  async refresh(req: Request, res: Response, next: any) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw ApiError.UnauthorizedError();
      }
      const userData = token.validateRefreshToken(refreshToken);
      const tokenFromDB = await token.findToken(refreshToken);
      if (!userData || !tokenFromDB) {
        throw ApiError.UnauthorizedError();
      }
      const user = await User.findById(tokenFromDB.user);
      const userDto = new UserDto(user);
      const tokens = await token.generateToken({ ...userDto });
      await token.saveToken(userDto.id, tokens.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json({ ...tokens, user: userDto });
    } catch (e) {
      next(e);
    }
  }
  async users(req: Request, res: Response, next: any) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
