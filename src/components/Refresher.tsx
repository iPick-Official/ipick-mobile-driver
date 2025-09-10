import React from 'react';
import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { RefresherCustomEvent } from '@ionic/core';

type RefresherProps = {
    onRefresh: (event: RefresherCustomEvent) => void;
};

const Refresher: React.FC<RefresherProps> = ({ onRefresh }) => {
    return (
        <IonRefresher slot="fixed" onIonRefresh={onRefresh} className="custom-refresher">
            <IonRefresherContent
                color="dark"
                pullingIcon={chevronDownCircleOutline}
                pullingText="Pull to refresh"
                refreshingSpinner="crescent"
            />
        </IonRefresher>
    );
};

export default Refresher;
