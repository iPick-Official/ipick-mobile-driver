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

    const [phone, setPhone] = useState("");
    const mobileRef = useRef<HTMLIonInputElement>(null);

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
        const lastTenDigits = normalizedMobile.slice(-10);
        localStorage.setItem("mobileNumber", lastTenDigits);
        let formattedPhone = phone;

        if (!confirmation) {
            const mobileValue = mobileRef.current?.value?.toString() || "";
            if (!mobileValue.startsWith("09") || mobileValue.length !== 11) {
                setToastMsg("Enter a valid PH number (09xxxxxxxxx)");
                setShowToast(true);
                return;
            }
            formattedPhone = "+63" + mobileValue.slice(1);
            setPhone(formattedPhone);
        }

        try {
            setLoading(true);
            setOtp("");
            setHasError(false);

            // Choose endpoint based on mode
            const endpoint =
                mode === "login" ? "/auth/send-otp/existing" : "/auth/send-otp/new";

            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}${endpoint}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: formattedPhone }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send OTP");

            if (!confirmation) setConfirmation(true);

            setToastMsg("OTP sent!");
            setShowToast(true);
            setTimer(60);
        } catch (err: any) {
            console.error(err);
            setToastMsg(err.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    /* ------------------- VERIFY OTP ------------------- */
    const verifyOtp = async () => {
        if (otp.length !== 6) return;

        try {
            setLoading(true);
            setHasError(false);

            const res = await fetch(
                `${import.meta.env.VITE_API_ENDPOINT}/auth/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, code: otp }),
                }
            );

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.message || "Invalid OTP");
            }

            setToastMsg("OTP verified! Redirecting...");
            setShowToast(true);
            setConfirmation(false);
            if (mode === "login") {
                history.push("/new-password");
            } else if (mode === "signup") {
                history.push("/register");
            }
        } catch (err: any) {
            setHasError(true);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setOtp("");
            setToastMsg(err.message || "Invalid OTP.");
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
                </div>

                {/* PHONE INPUT */}
                {!confirmation && (
                    <>
                        <IonText>
                            <p style={{ textAlign: "center", marginLeft: "2rem", marginRight: "2rem" }}>
                                {mode === "login"
                                    ? "Enter your phone number to reset your password."
                                    : "Let's get started! Enter your phone number for verification."}
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
                                <strong>{phone}</strong>
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
                                    onClick={sendOtp}
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
