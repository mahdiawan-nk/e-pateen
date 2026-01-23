import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                    src="/logo.png"
                    alt="Kampung Patin Logo"
                    className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    E-PATEEN
                </span>
            </div>
        </>
    );
}
