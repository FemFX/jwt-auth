import axios from "axios";
import { makeAutoObservable } from "mobx";
import { API_URL } from "../http";
import { IAuthResponse } from "../interfaces/auth";
import { IUser } from "../interfaces/user";
import AuthService from "../services/auth";

export default class Store {
  user = {} as IUser;
  isAuth: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }
  setAuth(bool: boolean) {
    this.isAuth = bool;
  }
  setUser(user: IUser) {
    this.user = user;
  }
  async login(email: string, password: string) {
    try {
      const response = await AuthService.login(email, password);
      console.log(response);
      localStorage.setItem("token", response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
  async register(email: string, password: string) {
    try {
      const response = await AuthService.registration(email, password);
      console.log(response);
      localStorage.setItem("token", response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
  async logout() {
    try {
      await AuthService.logout();
      localStorage.removeItem("token");
      this.setAuth(false);
      this.setUser({} as IUser);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
  async checkAuth() {
    try {
      const response = await axios.get<IAuthResponse>(`${API_URL}refresh`, {
        withCredentials: true,
      });
      console.log(response);
      localStorage.setItem("token", response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
}
