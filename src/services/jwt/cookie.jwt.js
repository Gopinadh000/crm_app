const isProd = () => process.env.APP_ENV === "PROD";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? "none" : "lax",
  path: "/",
  maxAge: maxAgeMs,
});

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const accessMs = Number(process.env.JWT_ACCESS_COOKIE_MS) || 15 * 60 * 1000;
  const refreshMs =
    Number(process.env.JWT_REFRESH_COOKIE_MS) || 7 * 24 * 60 * 60 * 1000;

  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(accessMs));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshMs));
};

export const clearAuthCookies = (res) => {
  const clearOpts = {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax",
    path: "/",
  };

  res.clearCookie(ACCESS_COOKIE, clearOpts);
  res.clearCookie(REFRESH_COOKIE, clearOpts);
};
