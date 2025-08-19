import {Properties, trackableRoutes, TrackingEventNames} from "@/constants";
import posthog from "posthog-js";

const track = (
    eventName: TrackingEventNames,
    properties?: Properties
) => {
    const baseProperties = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    };

    posthog.capture(eventName, {
        ...baseProperties,
        ...properties
    });
};

export const trackPageView = (pathname: string) => {
    const matchedRoute = trackableRoutes.find(route => pathname.includes(route.path));

    if (matchedRoute) {
        track(matchedRoute.event_name, {
            path: pathname,
            ...matchedRoute.properties
        });
    }
};

export const trackUserAction = {
    auth: {
        registrationCompleted: (properties?: Properties) => {
            track(TrackingEventNames.REGISTRATION_COMPLETED, {
                success: true,
                ...properties
            });
        },

        loginSuccessful: (properties?: Properties) => {
            track(TrackingEventNames.LOGIN_SUCCESSFUL, {
                success: true,
                ...properties
            });
        },

        passwordResetRequested: (properties?: Properties) => {
            track(TrackingEventNames.PASSWORD_RESET_REQUESTED, properties);
        },

        passwordResetCompleted: (properties?: Properties) => {
            track(TrackingEventNames.PASSWORD_RESET_COMPLETED, {
                success: true,
                ...properties
            });
        }
    },

    profile: {
        updated: (properties?: Properties) => {
            track(TrackingEventNames.PROFILE_UPDATED, properties);
        }
    },

    subscription: {
        changed: (properties?: Properties) => {
            track(TrackingEventNames.SUBSCRIPTION_CHANGED, properties);
        }
    },

    interaction: {
        buttonClicked: (buttonName: string, properties?: Properties) => {
            track(TrackingEventNames.BUTTON_CLICKED, {
                button_name: buttonName,
                ...properties
            });
        },

        formSubmitted: (formName: string, properties?: Properties) => {
            track(TrackingEventNames.FORM_SUBMITTED, {
                form_name: formName,
                ...properties
            });
        }
    }
};