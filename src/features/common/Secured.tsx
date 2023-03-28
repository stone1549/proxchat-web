import React, { PropsWithChildren, useContext, useEffect } from "react";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";

export const Secured: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  console.log("rendering Secured");
  return <>{children}</>;
};
