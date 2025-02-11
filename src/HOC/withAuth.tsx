import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setTokens } from "../features/auth/authSlice";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";

type JWTResponse = {
  sub: string
  'cognito:groups': string[]
  "iss": string
  "version": number
  "client_id": string
  "origin_jti": string
  "token_use": string
  "scope": string
  "auth_time": number
  "exp": number
  "iat": number
  "jti": string
  "username": string
}



const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: object) => {
    const { accessToken, refreshToken, idToken } = useSelector(
      (state: RootState) => state.authStore
    );
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
      console.log("Check");
      if (!accessToken) {
        navigate("/");
        return;
      }
      const decodedAccessToken: JWTResponse = jwt_decode(accessToken)
      
      const expirationTimeInSeconds = decodedAccessToken.exp;

      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const timeDifference = expirationTimeInSeconds - currentTimeInSeconds;

      console.log(timeDifference);

      if ( timeDifference <= 300 ) {
        if ( timeDifference <= 0 ) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("id_token");
          localStorage.removeItem("refresh_token");
          dispatch(setTokens({ accessToken: "", refreshToken: "", idToken: "" }));

          const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
          const domain = import.meta.env.VITE_COGNITO_DOMAIN;
          window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=http://localhost:5173`;
          return;
        }

        if (!refreshToken) {
          console.log("No Refresh Token");
          return;
        }

        try {
          await handleRefreshToken(refreshToken, dispatch);
        } catch (error) {
          console.error("Token refresh error:", error);
          navigate("/error");
        }
      }

      setLoading(false);
    };

    useEffect(() => {
      checkAuth();
    }, [accessToken, refreshToken, idToken, dispatch]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

const handleRefreshToken = async (refreshToken: string, dispatch: Dispatch<AnyAction>) => {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET;
  const storedRefreshToken = refreshToken;
  const formData = new URLSearchParams();
  formData.append("grant_type", "refresh_token");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);
  formData.append("refresh_token", refreshToken);

  try {
    const response = await axios.post(
      import.meta.env.VITE_COGNITO_TOKEN_ENDPOINT,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, id_token } = response.data;
    await dispatch(
      setTokens({
        accessToken: access_token,
        refreshToken: storedRefreshToken,
        idToken: id_token,
      })
    );
  } catch (error) {
    console.error("Token exchange error:", error);
    throw error;
  }
};
