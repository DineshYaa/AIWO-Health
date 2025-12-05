import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Simple redirect component
export default function RolesPage() {
    const [, setLocation] = useLocation();

    useEffect(() => {
        setLocation('/roles');
    }, [setLocation]);

    return null;
}
