import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "../SignOutButton/SignOutButton";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface UserData {
  name: string;
  email?: string;
}

interface Navbar2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  userdata?: UserData;
}

const Navbar2 = ({
  logo = {
    url: "/",
    src: "logo.svg",
    alt: "logo",
    title: "VibeTrackr",
  },
  menu = [
    { title: "Overview", url: "/dashboard" },
    { title: "Insights", url: "/insights" }
  ],
  userdata,
}: Navbar2Props) => {
  const location = useLocation();

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        {/* Desktop Navbar */}
        <nav className="hidden lg:flex justify-between items-center">
          {/* Left side: Logo + Menu */}
          <div className="flex items-center gap-8">
            <Link
              to={logo.url}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img src={logo.src} alt={logo.alt} className="max-h-8" />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {logo.title}
              </span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                {menu.map((item) => renderMenuItem(item, location.pathname))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side: User Menu */}
          {userdata && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userdata.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight text-left min-w-[140px]">
                    <span className="text-sm font-medium text-foreground">
                      {userdata.name}
                    </span>
                    {userdata.email && (
                      <span className="text-xs text-muted-foreground truncate">
                        {userdata.email}
                      </span>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                className="w-48 bg-popover text-popover-foreground rounded-md shadow-lg"
              >
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3 px-2 py-1.5 max-w-[220px] overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{userdata.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {userdata.name}
                      </span>
                      {userdata.email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {userdata.email}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Navbar */}
        <div className="flex lg:hidden items-center justify-between">
          <Link to={logo.url} className="flex items-center gap-2">
            <img src={logo.src} alt={logo.alt} className="max-h-8" />
            <span className="sr-only">{logo.title}</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-64 p-6">
              <SheetHeader>
                <SheetTitle>
                  <Link to={logo.url} className="flex items-center gap-2">
                    <img src={logo.src} alt={logo.alt} className="max-h-8" />
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                      {logo.title}
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-6">
                <Accordion
                  type="single"
                  collapsible
                  className="flex flex-col gap-4"
                >
                  {menu.map((item) => renderMobileMenuItem(item, location.pathname))}
                </Accordion>

                {userdata && (
                  <div className="pt-4 border-t border-muted-foreground/30">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex items-center gap-3 rounded-md px-3 py-2 w-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                          aria-label="User menu"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{userdata.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col leading-tight text-left min-w-[140px]">
                            <span className="text-sm font-medium text-foreground">
                              {userdata.name}
                            </span>
                            {userdata.email && (
                              <span className="text-xs text-muted-foreground truncate">
                                {userdata.email}
                              </span>
                            )}
                          </div>
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="w-48 bg-popover text-popover-foreground rounded-md shadow-lg"
                      >
                        <DropdownMenuLabel>
                          <div className="flex items-center gap-3 px-2 py-1.5 max-w-[220px] overflow-hidden">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{userdata.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left overflow-hidden">
                              <span className="text-sm font-medium truncate">
                                {userdata.name}
                              </span>
                              {userdata.email && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {userdata.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <SignOutButton className="w-full text-left" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem, currentPath: string) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="cursor-pointer text-foreground font-semibold hover:text-accent-foreground transition-colors">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground rounded-md shadow-lg p-4">
          <div className="flex flex-col space-y-2">
            {item.items.map((subItem) => (
              <NavigationMenuLink asChild key={subItem.title} className="w-72">
                <SubMenuLink item={subItem} />
              </NavigationMenuLink>
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  const isActive = currentPath === item.url;

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className={`inline-flex h-10 items-center justify-center rounded-none border-b-2 text-sm font-medium text-foreground transition-colors ${
          isActive
            ? "border-sky-500 text-sky-500"
            : "border-transparent hover:border-sky-500 hover:text-sky-500"
        }`}
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};


const renderMobileMenuItem = (item: MenuItem, currentPath: string) => {
  if (item.items) {
    return (
      <AccordionItem
        key={item.title}
        value={item.title}
        className="border-b border-muted-foreground/20"
      >
        <AccordionTrigger className="text-md font-semibold py-2 hover:text-accent-foreground transition-colors">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 flex flex-col space-y-1">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  const isActive = currentPath === item.url;

  return (
    <Link
      key={item.title}
      to={item.url}
      className={`text-md font-semibold py-2 hover:text-accent-foreground transition-colors ${
        isActive ? "border-b-2 border-purple-700" : ""
      }`}
    >
      {item.title}
    </Link>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      href={item.url}
      className="flex items-center gap-4 rounded-md p-3 hover:bg-muted hover:text-accent-foreground transition-colors"
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm text-muted-foreground leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar2 };
