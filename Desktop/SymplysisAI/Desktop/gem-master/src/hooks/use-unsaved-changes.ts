import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

function deepEqual(a: any, b: any) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch (e) {
        return false;
    }
}

export function useUnsavedChanges(currentValues: any, isLoading: boolean = false) {
    const router = useRouter();
    const initialValues = useRef<any>(null);
    const [isDirty, setIsDirty] = useState(false);
    const hasLoaded = useRef(false);

    // Capture initial values when loading finishes
    useEffect(() => {
        if (!isLoading && !hasLoaded.current && currentValues !== undefined) {
            initialValues.current = JSON.parse(JSON.stringify(currentValues));
            hasLoaded.current = true;
        }
    }, [isLoading, currentValues]);

    // Check for changes
    useEffect(() => {
        if (isLoading || !hasLoaded.current) return;

        const changed = !deepEqual(currentValues, initialValues.current);
        setIsDirty(changed);
    }, [currentValues, isLoading]);

    // Handle beforeunload (Tab Close / Reload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        if (isDirty) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    // Handle internal navigation (Link Clicks)
    useEffect(() => {
        if (!isDirty) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href) {
                // Ignore hash links or empty links
                const rawHref = anchor.getAttribute('href');
                if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

                // Check for internal link
                const isInternal = anchor.host === window.location.host;
                const isBlank = anchor.target === '_blank';

                if (isInternal && !isBlank) {
                    // Prevent default navigation
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    // Show confirmation
                    // Using standard browser confirm as requested ("js notification")
                    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');

                    if (confirmed) {
                        // Proceed with navigation
                        const url = new URL(anchor.href);
                        const path = url.pathname + url.search + url.hash;
                        router.push(path);
                    }
                }
            }
        };

        // Capture phase to intercept quickly
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [isDirty, router]);

    // Function to manually reset clean state (e.g. after save)
    const resetDiff = () => {
        initialValues.current = JSON.parse(JSON.stringify(currentValues));
        setIsDirty(false);
    };

    return { isDirty, resetDiff };
}
