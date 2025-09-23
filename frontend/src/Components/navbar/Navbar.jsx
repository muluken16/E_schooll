import React, { useEffect, useState } from 'react';
import { NavBarContainer, Logo, LogoutButton, MenuButton } from './styles';
import { getToken, clearToken } from '../utils/auth';

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 1 minute
const WARNING_TIME = 10 * 1000; // 10 seconds

const Navbar = ({ onLogout, toggleSidebar }) => {
    const [timeLeft, setTimeLeft] = useState(INACTIVITY_LIMIT / 1000);
    const [warningShown, setWarningShown] = useState(false);

    useEffect(() => {
        let timer;
        let countdown;

        const resetTimer = () => {
            clearTimeout(timer);
            clearInterval(countdown);
            setTimeLeft(INACTIVITY_LIMIT / 1000);
            setWarningShown(false);

            // start countdown
            countdown = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;

                    // if (next === 10 && !warningShown) {
                        //alert("Your session will expire in 10 seconds!");
                        //setWarningShown(true);
                    //}

                    if (next <= 0) {
                        clearInterval(countdown);
                        clearToken();
                        onLogout();
                        return 0;
                    }

                    return next;
                });
            }, 1000);

            // set inactivity timeout
            timer = setTimeout(() => {
                clearToken();
                onLogout();
            }, INACTIVITY_LIMIT);
        };

        // listen for user activity
        const events = ["mousemove", "keydown", "click"];
        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer(); // start on mount

        return () => {
            clearTimeout(timer);
            clearInterval(countdown);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [onLogout, warningShown]);

    return (
        <NavBarContainer>
            <MenuButton onClick={toggleSidebar}>☰</MenuButton>
            <Logo>EduPortal</Logo>
            <div>
                {timeLeft > 0 ? `Idle Timeout: ${timeLeft}s` : "Session expired"}
            </div>
            <LogoutButton onClick={onLogout}>Logout</LogoutButton>
        </NavBarContainer>
    );
};

export default Navbar;
