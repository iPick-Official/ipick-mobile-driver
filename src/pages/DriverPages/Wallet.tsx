import React, { useEffect, useRef, useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonLabel,
  IonText,
  IonInput,
  IonIcon,
  IonSkeletonText,
  IonModal,
  IonImg,
  IonSelect,
  IonSelectOption,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import BackButton from "../../components/BackButton";
import { searchOutline, closeOutline } from "ionicons/icons";
import {
  fetchWallet,
  fetchDriverTransactions,
} from "../../services/apiService";
import { useHistory } from "react-router";

const Wallet: React.FC = () => {
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");
  const driverData = JSON.parse(localStorage.getItem("driverData") || "{}");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const modalRef = useRef<HTMLIonModalElement>(null);
  const cashInAmountRef = useRef<number>(0);
  const cashOutAmountRef = useRef<number>(0);
  const bankAccountRef = useRef<string | null>(null);
  const selectedBankRef = useRef<string | null>(null);

  const selectedMethodRef = useRef<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(
    undefined
  );

  const [transferMethod, setTransferMethod] = useState<
    "cashin" | "cashout" | undefined
  >(undefined);

  const [bankDetails, setBankDetails] = useState<
    { bankCode: string; bankName: string }[]
  >([]);

  const ITEMS_PER_PAGE = 15;
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);

  const loadMoreData = (event: CustomEvent<void>) => {
    setTimeout(() => {
      setItemsToShow((prev) => {
        const newCount = prev + ITEMS_PER_PAGE;
        return newCount > transactions.length ? transactions.length : newCount;
      });
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }, 500);
  };

  useEffect(() => {
    const banks = [
      { bankCode: "UNIB", bankName: "UNION BANK" },
      { bankCode: "BPI", bankName: "BANK OF THE PHILIPPINE ISLANDS" },
    ];
    setBankDetails(banks);
  }, []);

  const handleCashIn = (method: string) => {
    selectedMethodRef.current = method;
    setSelectedMethod(method);
  };

  const handleConfirmCashOut = async () => {
    alert("Cash out feature is not implemented yet.");
    // Implement cash out logic here
    modalRef.current?.dismiss();
  };

  const handleConfirmCashIn = async () => {
    const amount = cashInAmountRef.current;
    const method = selectedMethodRef.current;

    if (!amount || amount < 100) {
      alert("Please enter a valid amount of at least 100.");
      return;
    }

    const url = `${import.meta.env.VITE_2C2P_URL}=${amount * 100
      }&user_id=${userId}&channel=${method}&user_type=${userType}`;

    try {
      window.location.href = url

    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    }

    modalRef.current?.dismiss();
    history.push("/");
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const walletData = await fetchWallet(driverData._id, "driver");
      const transactionData = await fetchDriverTransactions();

      if (walletData?.walletBalance !== undefined) {
        setWalletBalance(walletData.walletBalance);
      }

      if (Array.isArray(transactionData)) {
        setTransactions(transactionData);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <IonPage>
      <IonHeader collapse="fade" className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <IonTitle>Wallet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <IonItem lines="none" className="profile-item">
          <IonLabel className="ion-text-wrap">
            <h2>Current Balance</h2>
            {loading ? (
              <IonSkeletonText
                animated
                style={{ width: "100px", height: "30px" }}
              />
            ) : (
              <IonText color={walletBalance < 0 ? "danger" : "primary"}>
                <h1>
                  ₱
                  {walletBalance.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h1>
              </IonText>
            )}
          </IonLabel>
          <IonButton
            slot="end"
            fill="solid"
            color="primary"
            disabled={loading}
            onClick={() => {
              setTransferMethod("cashin");
              modalRef.current?.present();
            }}
          >
            Top Up
          </IonButton>

          {/* TODO: Not implemented yet */}
          {/* <IonButton
            slot="end"
            fill="solid"
            color="danger"
            disabled={loading}
            onClick={() => {
              setTransferMethod("cashout");
              modalRef.current?.present();
            }}
          >
            Withdraw
          </IonButton> */}
        </IonItem>

        <IonList>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <IonItem lines="none" className="card-style" key={i}>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: "80%" }} />
                  <IonSkeletonText animated style={{ width: "60%" }} />
                </IonLabel>
                <IonSkeletonText
                  animated
                  style={{ width: "60px", height: "20px" }}
                />
              </IonItem>
            ))
          ) : transactions.length > 0 ? (
            <>
              {transactions
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                )
                .slice(0, itemsToShow) // Show limited items
                .map((tx) => (
                  <IonItem lines="none" className="card-payment" key={tx._id}>
                    <IonLabel>
                      <h2>{tx.description}</h2>
                      <p>{new Date(tx.createdAt).toLocaleString()}</p>
                    </IonLabel>
                    <IonText color={tx.amount > 0 ? "primary" : "secondary"}>
                      <strong>
                        {tx.amount > 0 ? "+" : "-"}₱
                        {Math.abs(tx.amount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </IonText>
                  </IonItem>
                ))}
              <IonInfiniteScroll
                onIonInfinite={loadMoreData}
                threshold="100px"
                disabled={itemsToShow >= transactions.length}
              >
                <IonInfiniteScrollContent loadingText="Loading more transactions..." />
              </IonInfiniteScroll>
            </>
          ) : (
            <div
              className="ion-no-border ion-text-center ion-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "40px",
              }}
            >
              <IonText color="medium">
                <p>No transactions found for this date.</p>
              </IonText>
              <IonIcon
                color="medium"
                icon={searchOutline}
                style={{ fontSize: "100px", marginBottom: "10px" }}
              />
            </div>
          )}
        </IonList>
      </IonContent>

      <IonModal
        ref={modalRef}
        trigger="open-modal"
        initialBreakpoint={0.75}
        backdropDismiss={true}
      >
        <IonHeader className="ion-no-border" collapse="fade">
          <IonToolbar className="ion-no-border">
            <IonTitle>
              {transferMethod === "cashin" ? "Top Up" : "Withdraw"}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() => modalRef.current?.dismiss()}
                color="danger"
              >
                <IonIcon icon={closeOutline} slot="start" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding" fullscreen>
          {transferMethod === "cashin" && (
            <>
              <IonList>
                <IonItem
                  button
                  detail={false}
                  onClick={() => handleCashIn("GCASH")}
                  color={selectedMethod === "GCASH" ? "light" : ""}
                >
                  <IonLabel>
                    <h2>GCash</h2>
                    <p>Use GCash to top up your wallet</p>
                  </IonLabel>
                  <IonImg
                    slot="end"
                    src="/assets/gcash.png"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                    alt="Gcash Logo"
                  />
                </IonItem>

                <IonItem
                  button
                  detail={false}
                  onClick={() => handleCashIn("PAYMAYA")}
                  color={selectedMethod === "PAYMAYA" ? "light" : ""}
                >
                  <IonLabel>
                    <h2>Maya</h2>
                    <p>Use Maya to top up your wallet</p>
                  </IonLabel>
                  <IonImg
                    slot="end"
                    src="/assets/maya.png"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                    alt="Maya Logo"
                  />
                </IonItem>
              </IonList>

              <IonItem>
                <IonInput
                  labelPlacement="floating"
                  label="Cash In Amount"
                  type="number"
                  inputmode="decimal"
                  min={1}
                  max={10000}
                  placeholder="0.00"
                  onIonChange={(e) => {
                    const val = parseFloat(e.detail.value!);
                    cashInAmountRef.current = isNaN(val) ? 0 : val;
                  }}
                />
              </IonItem>

              <IonButton
                className="custom-button"
                expand="full"
                shape="round"
                size="large"
                onClick={handleConfirmCashIn}
                disabled={cashInAmountRef.current <= 100 && !selectedMethod}
              >
                Confirm
              </IonButton>
            </>
          )}

          {transferMethod === "cashout" && (
            <>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Bank</IonLabel>
                  <IonSelect
                    interface="action-sheet"
                    justify="start"
                    slot="end"
                    placeholder="Select Bank"
                    onIonChange={(e) =>
                      (selectedBankRef.current = e.detail.value)
                    }
                  >
                    {bankDetails.map((bank) => (
                      <IonSelectOption
                        key={bank.bankCode}
                        value={bank.bankCode}
                      >
                        {bank.bankName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Bank Account Number</IonLabel>
                  <IonInput
                    placeholder="Enter account number"
                    onIonChange={(e) =>
                      (bankAccountRef.current = e.detail.value!)
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Withdraw Amount</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="0.00"
                    onIonChange={(e) => {
                      const val = parseFloat(e.detail.value!);
                      cashOutAmountRef.current = isNaN(val) ? 0 : val;
                    }}
                  />
                </IonItem>
              </IonList>

              <IonButton
                className="custom-button"
                expand="full"
                shape="round"
                size="large"
                onClick={handleConfirmCashOut}
              >
                Withdraw
              </IonButton>
            </>
          )}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Wallet;