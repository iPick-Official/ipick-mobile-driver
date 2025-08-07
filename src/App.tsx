import {
  IonApp,
  IonLoading,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import React, { useEffect } from "react";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "./theme/variables.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Menu from "./components/Menu";
import Home from "./pages/DriverPages/Home";
import DriverTrip from "./pages/DriverPages/DriverTrip";
import MyProfile from "./pages/DriverPages/MyProfile";

import Login from "./pages/AuthPages/Login";
import Register from "./pages/AuthPages/Register";
import UpdatePassword from "./pages/AuthPages/UpdatePassword";

import Checklist from "./pages/OnboardingPages/Checklist";
import PersonalInfo from "./pages/OnboardingPages/PersonalInfo";
import PersonlaReq from "./pages/OnboardingPages/PersonalReq";
import TransportReq from "./pages/OnboardingPages/TransportReq";
import Earnings from "./pages/DriverPages/Earnings";
import Wallet from "./pages/DriverPages/Wallet";
import Messages from "./pages/DriverPages/Messages";
import HelpCenter from "./pages/DriverPages/HelpCenter";
import Settings from "./pages/DriverPages/Settings";
import { enableKeepAwake, disableKeepAwake } from "./utils/KeepAwake";
import { fetchActiveJobs } from "./services/apiService";
import VersionCheck from "./components/VersionCheck";
import { LocationProvider } from "./contexts/LocationContext";

setupIonicReact();

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <IonLoading isOpen message="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const AppContentInner: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const driverStatus = localStorage.getItem("status");

  useEffect(() => {
    enableKeepAwake();

    return () => {
      disableKeepAwake(); // Optional: clean up on unmount
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchActiveJobs(logout);
    }, 30000);
    return () => clearInterval(intervalId);
  }, [logout]);

  const shouldShowMenu =
    isAuthenticated &&
    driverStatus === "approved" &&
    location.pathname === "/home";

  return (
    <IonSplitPane contentId="main">
      {shouldShowMenu && <Menu />}
      <VersionCheck />
      <IonRouterOutlet id="main">
        {/* Public Routes */}
        <Route path="/login" exact>
          <Login />
        </Route>
        <Route path="/register" exact>
          <Register />
        </Route>
        <Route path="/new-password" exact>
          <UpdatePassword />
        </Route>

        {/* Protected Routes */}
        <PrivateRoute path="/home" exact component={Home} />
        <PrivateRoute path="/driver-trip" exact component={DriverTrip} />
        <PrivateRoute path="/my-profile" exact component={MyProfile} />
        <PrivateRoute path="/earnings" exact component={Earnings} />
        <PrivateRoute path="/wallet" exact component={Wallet} />
        <PrivateRoute path="/messages" exact component={Messages} />
        <PrivateRoute path="/help-center" exact component={HelpCenter} />
        <PrivateRoute path="/settings" exact component={Settings} />
        <PrivateRoute path="/checklist" exact component={Checklist} />
        <PrivateRoute path="/personal-info" exact component={PersonalInfo} />
        <PrivateRoute path="/personal-req" exact component={PersonlaReq} />
        <PrivateRoute path="/transport-req" exact component={TransportReq} />
        <Redirect exact from="/" to="/messages" />

        {/* Root Redirect */}
        <Route path="/" exact>
          {!isAuthenticated ? (
            <Redirect to="/login" />
          ) : driverStatus === "pending" ? (
            <Redirect to="/checklist" />
          ) : driverStatus === "approved" ? (
            <Redirect to="/home" />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const AppContent: React.FC = () => (
  <IonReactRouter>
    <AppContentInner />
  </IonReactRouter>
);

const App: React.FC = () => {
  return (
    <IonApp>
      <LocationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocationProvider>
    </IonApp>
  );
};

export default App;
