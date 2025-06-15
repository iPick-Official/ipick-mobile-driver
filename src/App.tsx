import {
  IonApp,
  IonLoading,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, RouteProps } from "react-router-dom";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

import "./theme/variables.css";
import Menu from "./components/Menu";
import Home from "./pages/DriverPages/Home";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/AuthPages/Login";
import Register from "./pages/AuthPages/Register";
import UpdatePassword from "./pages/AuthPages/UpdatePassword";

import Checklist from "./pages/OnboardingPages/Checklist";
import PersonalInfo from "./pages/OnboardingPages/PersonalInfo";
import PersonlaReq from "./pages/OnboardingPages/PersonalReq";
import TransportReq from "./pages/OnboardingPages/TransportReq";

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

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <IonReactRouter>
      <IonSplitPane contentId="main">
        {isAuthenticated && <Menu />}
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
          <PrivateRoute path="/checklist" exact component={Checklist} />
          <PrivateRoute path="/home" exact component={Home} />
          <PrivateRoute path="/personal-info" exact component={PersonalInfo} />
          <PrivateRoute path="/personal-req" exact component={PersonlaReq} />
          <PrivateRoute path="/transport-req" exact component={TransportReq} />

          {/* Root Redirect */}
          <Route path="/" exact>
            <Redirect to={isAuthenticated ? "/checklist" : "/login"} />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </IonApp>
  );
};

export default App;
