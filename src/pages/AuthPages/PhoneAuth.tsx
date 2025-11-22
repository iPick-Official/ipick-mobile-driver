import React, { useRef, useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonLabel,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonToast,
    IonSpinner,
    IonText,
    IonInputOtp,
    IonImg,
    IonButtons,
} from "@ionic/react";
import BackButton from "../../components/BackButton";
import { useHistory, useLocation } from "react-router";

const PhoneAuth: React.FC = () => {
    const location = useLocation();
    const history = useHistory();
    const mode = (location.state as any)?.mode || "login";
    const mobileRef = useRef<HTMLIonInputElement>(null);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmation, setConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [shake, setShake] = useState(false);

    const [toastMsg, setToastMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    /* ------------------- SEND OTP ------------------- */
    const sendOtp = async () => {
        const normalizedMobile = String(mobileRef.current?.value ?? "").trim();
        const lastTenDigits = normalizedMobile.replace(/\D/g, "").slice(-10);

        if (lastTenDigits.length !== 10) {
            setToastMsg("Please enter a valid 11-digit mobile number");
            setShowToast(true);
            return;
        }

        setPhone(lastTenDigits);
        localStorage.setItem("mobileNumber", lastTenDigits);

        try {
            setLoading(true);
            setOtp("");
            setHasError(false);

            const endpoint =
                mode === "login"
                    ? `/otp/requestOtpReset/${lastTenDigits}`
                    : `/otp/requestOtp/${lastTenDigits}`;

            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}${endpoint}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                }
            );

            const data = await res.json();

            if (!res.ok) {
                const message =
                    data?.message || "Failed to send OTP. Please try again.";
                throw new Error(message);
            }

            if (!confirmation) setConfirmation(true);
            setToastMsg("OTP sent!");
            setShowToast(true);
            setTimer(60);

        } catch (err: any) {
            console.error("OTP Error:", err);
            setToastMsg(err.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    /* ------------------- RESEND OTP ------------------- */
    const resendOtp = async () => {
        const mobnum = localStorage.getItem("mobileNumber") || "";
        try {
            setLoading(true);
            setOtp("");
            setHasError(false);

            const endpoint =
                mode === "login"
                    ? `/otp/requestOtpReset/${mobnum}`
                    : `/otp/requestOtp/${mobnum}`;

            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}${endpoint}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                }
            );

            const data = await res.json();

            if (!res.ok) {
                const message =
                    data?.message || "Failed to resend OTP. Please try again.";
                throw new Error(message);
            }

            setToastMsg("OTP resent!");
            setShowToast(true);
            setTimer(60);

        } catch (err: any) {
            console.error("Resend OTP Error:", err);
            setToastMsg(err.message || "Failed to resend OTP");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    /* ------------------- VERIFY OTP ------------------- */
    const verifyOtp = async () => {
        const mobnum = localStorage.getItem("mobileNumber") || "";

        // Basic validation
        if (otp.length !== 6 || mobnum.length !== 10) return;

        try {
            setLoading(true);
            setHasError(false);

            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}/otp/validate/${mobnum}/${otp}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                setConfirmation(false);
                if (res.ok) {
                    setConfirmation(false);
                    history.push(mode === "login" ? "/new-password" : "/register");
                }

            } else {
                console.error("OTP verification failed:", data || res.statusText);
                setHasError(true);
                setShake(true);
                setTimeout(() => setShake(false), 600);
                setOtp("");
                setToastMsg(data?.message || "Incorrect OTP. Please try again.");
                setShowToast(true);
            }
        } catch (err: any) {
            console.error("OTP verify error:", err);
            setHasError(true);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setOtp("");
            setToastMsg("Incorrect OTP. Please try again.");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    /* ------------------- TIMER ------------------- */
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <BackButton />
                    </IonButtons>
                    <IonLabel slot="end" style={{ margin: 10, fontSize: 12 }}>
                        v{import.meta.env.VITE_CURRENT_VERSION}
                    </IonLabel>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <div className="ion-text-center" style={{ marginBottom: "3rem" }}>
                    <IonImg src="/assets/logo-word.png" className="logo-image" />
                    <div
                        style={{
                            color: "#008000",
                            textAlign: "center",
                            marginBottom: "30px",
                            fontWeight: 600,
                            fontSize: "1.3rem",
                        }}
                    >
                        Driver's App
                    </div>
                </div>

                {/* PHONE INPUT */}
                {!confirmation && (
                    <>
                        <IonText>
                            <p style={{ textAlign: "center", marginLeft: "2rem", marginRight: "2rem" }}>
                                {mode === "login"
                                    ? "Enter your phone number to reset your password."
                                    : "Enter your phone number for verification."}
                            </p>
                        </IonText>
                        <IonItem lines="none" className="input-field">
                            <IonInput
                                ref={mobileRef}
                                type="tel"
                                inputMode="numeric"
                                maxlength={11}
                                placeholder="09xxxxxxxxx"
                                label="Mobile Number"
                                labelPlacement="floating"
                            />
                        </IonItem>

                        <IonButton
                            className="custom-button"
                            expand="full"
                            shape="round"
                            size="large"
                            onClick={sendOtp}
                        >
                            {loading ? <IonSpinner /> : "Submit"}
                        </IonButton>
                    </>
                )}

                {/* OTP INPUT */}
                {confirmation && (
                    <div style={{ textAlign: "center", width: "100%" }}>
                        <IonText>
                            <p style={{ textAlign: "center", marginBottom: "1rem" }}>
                                Enter the 6-digit code sent to <br />
                                <strong>+63{phone}</strong>
                            </p>
                        </IonText>

                        <div
                            className={`otp-wrapper ${shake ? "shake" : ""}`}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "1rem",
                            }}
                        >
                            <IonInputOtp
                                length={6}
                                value={otp}
                                disabled={loading}
                                className={hasError ? "otp-error" : ""}
                                onIonInput={(e) => {
                                    const value = e.detail.value!;
                                    setOtp(value);
                                }}
                            />
                        </div>

                        {timer > 0 ? (
                            <p style={{ textAlign: "center", marginTop: "1rem" }}>
                                Resend code in {timer}s
                            </p>
                        ) : (
                            <p style={{ textAlign: "center", marginTop: "1rem" }}>
                                <a
                                    onClick={resendOtp}
                                    style={{
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        color: "#3880ff",
                                    }}
                                >
                                    Resend Code
                                </a>
                            </p>
                        )}

                        <IonButton
                            className="custom-button"
                            expand="full"
                            shape="round"
                            size="large"
                            onClick={verifyOtp}
                        >
                            {loading ? <IonSpinner /> : "Submit"}
                        </IonButton>
                    </div>
                )}

                {/* TOAST */}
                <IonToast
                    position="top"
                    color="dark"
                    isOpen={showToast}
                    message={toastMsg}
                    duration={2200}
                    onDidDismiss={() => setShowToast(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default PhoneAuth;
