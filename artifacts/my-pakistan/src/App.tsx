import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Provinces from "@/pages/provinces";
import ProvinceDetail from "@/pages/province-detail";
import LocationDetail from "@/pages/location-detail";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(144 100% 16%)",
    colorForeground: "hsl(20 14% 4%)",
    colorMutedForeground: "hsl(25 5% 45%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(40 20% 85%)",
    colorInputForeground: "hsl(20 14% 4%)",
    colorNeutral: "hsl(40 20% 85%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:underline",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground bg-white px-2",
    identityPreviewEditButton: "text-primary hover:underline",
    formFieldSuccessText: "text-primary",
    alertText: "text-destructive",
    logoBox: "flex justify-center mb-4",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border border-border hover:bg-secondary transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
    formFieldInput: "border-border bg-white text-foreground focus:ring-primary focus:border-primary",
    footerAction: "flex justify-center gap-1",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive",
    otpCodeFieldInput: "border-border bg-white text-foreground focus:ring-primary focus:border-primary",
    formFieldRow: "mb-4",
    main: "w-full",
  },
};

const queryClient = new QueryClient();

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Only redirect if signed in
  }, []);

  return (
    <>
      <Show when="signed-in">
        {/* We can't use wouter's useLocation inside the body directly if it loops, so we'll just redirect the component mount */}
        {(() => {
          // Delay the redirect to avoid state updates during render
          setTimeout(() => setLocation('/explore'), 0);
          return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
        })()}
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

// Ensure protected routes redirect to sign in if logged out
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        {(() => {
          setTimeout(() => setLocation('/sign-in'), 0);
          return null;
        })()}
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col">
              <Switch>
                <Route path="/" component={HomeRedirect} />
                <Route path="/sign-in/*?" component={SignInPage} />
                <Route path="/sign-up/*?" component={SignUpPage} />
                
                <Route path="/explore" component={Explore} />
                <Route path="/provinces" component={Provinces} />
                <Route path="/provinces/:slug" component={ProvinceDetail} />
                <Route path="/locations/:id" component={LocationDetail} />
                
                <Route path="/dashboard">
                  {() => <ProtectedRoute><Dashboard /></ProtectedRoute>}
                </Route>
                <Route path="/profile">
                  {() => <ProtectedRoute><Profile /></ProtectedRoute>}
                </Route>
                
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
      <Toaster />
    </WouterRouter>
  );
}

export default App;
