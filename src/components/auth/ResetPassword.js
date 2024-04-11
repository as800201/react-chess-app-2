import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import queryString from "query-string";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { accountService, alertService } from "../../_services";

function ResetPassword({ history }) {
  // const [imageHeight, setImageHeight] = useState(0);
  // const imageRef = useRef(null);

  const TokenStatus = {
    Validating: "Validating",
    Valid: "Valid",
    Invalid: "Invalid",
  };

  const [token, setToken] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(TokenStatus.Validating);
  const navigate = useNavigate();
  function getForm() {
    const initialValues = {
      password: "",
      confirmPassword: "",
    };

    const validationSchema = Yup.object().shape({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    });

    function onSubmit({ password, confirmPassword }, { setSubmitting }) {
      alertService.clear();
      accountService
        .resetPassword({ token, password, confirmPassword })
        .then(() => {
          alertService.success("Password reset successful, you can now login", {
            keepAfterRouteChange: true,
          });
          navigate("/login");
        })
        .catch((error) => {
          setSubmitting(false);
          alertService.error(error);
        });
    }

    return (
      <div className="login grid grid-cols-2 px-20" style={{ height: "87vh" }}>
        <div className="flex justify-center items-center">
          <img
            src={`${window.location.pathname.split("/")[0]}/bg_chesspanel.png`}
            alt="chesspanel"
            className="rounded-lg p-9 ml-10"
            style={{ height: "87vh", objectFit: "cover" }}
          />
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="flex flex-1 flex-col justify-center lg:px-8 px-10 py-10 mt-5">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                  <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset Password
                  </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Password
                        </label>
                      </div>
                      <div>
                        <Field
                          name="password"
                          type="password"
                          className={
                            "block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" +
                            (errors.password && touched.password
                              ? " is-invalid"
                              : "")
                          }
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback text-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Confirm Password
                        </label>
                      </div>
                      <div>
                        <Field
                          name="confirmPassword"
                          type="password"
                          className={
                            "block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" +
                            (errors.confirmPassword && touched.confirmPassword
                              ? " is-invalid"
                              : "")
                          }
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="invalid-feedback text-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-col w-full mt-2 mr-2 items-center justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {" "}
                        {isSubmitting && (
                          <span className="inline-block animate-spin rounded-full border-t-2 border-white-900 mr-3 w-4 h-4"></span>
                        )}
                        Reset
                      </button>
                      <Link
                        to="/login"
                        className="flex-col w-full mt-2 text-center justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Cancel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  }

  function getBody() {
    switch (tokenStatus) {
      case TokenStatus.Valid:
        return getForm();
      case TokenStatus.Invalid:
        return (
          <div>
            Token validation failed, if the token has expired you can get a new
            one at the <Link to="forgot-password">forgot password</Link> page.
          </div>
        );
      case TokenStatus.Validating:
        return <div>Validating token...</div>;
    }
  }

  useEffect(() => {
    // const divHeight = document.querySelector(".reset-password").offsetHeight;
    // setImageHeight(divHeight);

    const { token } = queryString.parse(window.location.search);

    // remove token from url to prevent http referer leakage
    // history.replace(location.pathname);

    accountService
      .validateResetToken(token)
      .then(() => {
        setToken(token);
        setTokenStatus(TokenStatus.Valid);
      })
      .catch(() => {
        setTokenStatus(TokenStatus.Invalid);
      });
  }, []);

  return (
    <div>
      <div>{getBody()}</div>
    </div>
  );
}

export default ResetPassword;