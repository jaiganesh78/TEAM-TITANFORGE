'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  TrendingUp,
  Clock,
  Settings,
  User,
  FileText,
  Database,
  Play,
  Cpu,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronsUpDown,
  Building,
  Check,
  Target,
  Megaphone,
  Zap,
  ShoppingCart,
  BarChart2,
  Heart
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; href: string }[];
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discovery Flow', href: '/discovery', icon: Compass },
  {
    name: 'Business Strategy',
    href: '#',
    icon: Briefcase,
    subItems: [
      { name: 'Executive Dashboard', href: '/business/executive-dashboard' },
      { name: 'KPI Analytics', href: '/business/analytics' },
      { name: 'Business Timeline', href: '/business/timeline' },
    ]
  },
  {
    name: 'Growth Engines',
    href: '#',
    icon: Target,
    subItems: [
      { name: 'Strategy Engine', href: '/strategy' },
      { name: 'Marketing Engine', href: '/marketing' },
      { name: 'Lead Generation', href: '/leads' },
      { name: 'Sales Engine', href: '/sales' },
      { name: 'Analytics Engine', href: '/analytics' },
      { name: 'Customer Success', href: '/customer-success' },
    ]
  },
  { name: 'AI Workspace', href: '/ai-workspace', icon: Cpu },
  {
    name: 'Settings & Assets',
    href: '#',
    icon: Settings,
    subItems: [
      { name: 'Company Profile', href: '/settings/profile' },
      { name: 'Uploaded Documents', href: '/settings/documents' },
      { name: 'Website Crawler', href: '/settings/website' },
      { name: 'Knowledge Review', href: '/settings/review' },
      { name: 'Knowledge Center', href: '/settings/knowledge' }
    ]
  }
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState({ name: 'Jai Ganesh', email: 'jai@titanforge.com', role: 'OWNER' });
  const [workspaces, setWorkspaces] = useState([
    { id: 'w1', name: 'TitanForge Core', role: 'Owner' },
    { id: 'w2', name: 'Apex Growth Lab', role: 'Admin' }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  // Handle default submenus based on route
  useEffect(() => {
    if (pathname.startsWith('/business/')) {
      setActiveSubmenu('Business Strategy');
    } else if (pathname.startsWith('/settings/')) {
      setActiveSubmenu('Settings & Assets');
    }
  }, [pathname]);

  // Dark/Light theme toggler
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    // Mock logout, clear storage
    router.push('/login');
  };

  // Build breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const name = part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return { name, href, isLast: index === pathParts.length - 1 };
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Workspace Switcher/Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border relative">
          {!sidebarCollapsed ? (
            <button 
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="flex items-center gap-2 hover:bg-accent/50 p-1.5 rounded-lg transition-colors w-full text-left"
            >
              <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center text-black font-extrabold text-sm shadow">
                TF
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate leading-none mb-0.5">{activeWorkspace.name}</p>
                <p className="text-[10px] text-muted-foreground leading-none">{activeWorkspace.role}</p>
              </div>
              <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
            </button>
          ) : (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-black font-extrabold text-sm mx-auto shadow"
            >
              TF
            </button>
          )}

          {/* Workspace Dropdown Panel */}
          <AnimatePresence>
            {workspaceOpen && !sidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-4 right-4 top-14 bg-popover border border-border rounded-lg shadow-xl p-1 z-50"
              >
                <p className="text-[9px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">Select Workspace</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent text-left text-xs transition-colors"
                  >
                    <span className="font-medium truncate">{ws.name}</span>
                    {activeWorkspace.id === ws.id && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const hasSub = !!item.subItems;
            const isSubOpen = activeSubmenu === item.name;
            const Icon = item.icon;

            if (sidebarCollapsed) {
              return (
                <div key={item.name} className="relative group flex justify-center py-2">
                  <Link 
                    href={hasSub ? '#' : item.href}
                    onClick={() => hasSub && setSidebarCollapsed(false)}
                    className={`p-2 rounded-lg hover:bg-accent transition-colors ${
                      pathname === item.href ? 'bg-accent/80 text-white' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                  <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-popover text-foreground border border-border px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
                    {item.name}
                  </span>
                </div>
              );
            }

            return (
              <div key={item.name} className="space-y-0.5">
                {hasSub ? (
                  <button
                    onClick={() => setActiveSubmenu(isSubOpen ? null : item.name)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground text-xs font-medium transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {isSubOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname === item.href 
                        ? 'bg-accent text-foreground font-semibold border-l-2 border-white' 
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )}

                {/* Submenu Expansion */}
                <AnimatePresence>
                  {hasSub && isSubOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6 pr-2 space-y-0.5"
                    >
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`block p-1.5 rounded text-[11px] transition-colors ${
                            pathname === sub.href
                              ? 'text-white font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between p-1 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold truncate leading-none mb-0.5">{user.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate leading-none">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex justify-center p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive mx-auto"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-40">
          
          {/* Mobile Menu & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 hover:bg-accent rounded-md md:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Collapse Sidebar Desktop Button */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb List */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Link href="/dashboard" className="hover:text-foreground">App</Link>
              {breadcrumbs.map((bc) => (
                <React.Fragment key={bc.href}>
                  <ChevronRight className="h-3 w-3" />
                  <Link 
                    href={bc.href} 
                    className={bc.isLast ? "text-foreground font-semibold pointer-events-none" : "hover:text-foreground"}
                  >
                    {bc.name}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-background"></span>
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-10 w-72 bg-popover border border-border rounded-lg shadow-xl p-2 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5 px-1">
                      <span className="text-xs font-semibold">Notifications</span>
                      <button className="text-[10px] text-muted-foreground hover:text-foreground font-medium">Mark all read</button>
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      <div className="p-2 rounded-md hover:bg-accent/40 text-xs border border-transparent hover:border-border/30 transition-all">
                        <p className="font-medium text-foreground">Discovery Complete</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Understanding score calculated: 85/100.</p>
                        <p className="text-[9px] text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                      <div className="p-2 rounded-md hover:bg-accent/40 text-xs border border-transparent hover:border-border/30 transition-all">
                        <p className="font-medium text-foreground">AWS Audit Alert</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Potential $7,500/mo cost savings identified.</p>
                        <p className="text-[9px] text-muted-foreground mt-1">5 hours ago</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold ring-2 ring-border hover:ring-white transition-all"
              >
                {user.name.charAt(0)}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-10 w-48 bg-popover border border-border rounded-lg shadow-xl p-1 z-50 text-xs"
                  >
                    <div className="px-2.5 py-2 border-b border-border">
                      <p className="font-semibold text-foreground leading-none">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate leading-none">{user.email}</p>
                    </div>
                    <Link 
                      href="/settings/profile" 
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 bg-card border-r border-border p-4 flex flex-col h-full z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-white flex items-center justify-center text-black font-extrabold text-xs shadow">
                    TF
                  </div>
                  <span className="font-semibold text-sm">TitanForge OS</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const hasSub = !!item.subItems;
                  const isSubOpen = activeSubmenu === item.name;
                  const Icon = item.icon;

                  return (
                    <div key={item.name} className="space-y-0.5">
                      {hasSub ? (
                        <div>
                          <button
                            onClick={() => setActiveSubmenu(isSubOpen ? null : item.name)}
                            className="w-full flex items-center justify-between p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground text-xs font-medium transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            {isSubOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </button>
                          
                          <AnimatePresence>
                            {isSubOpen && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-6 space-y-0.5 overflow-hidden"
                              >
                                {item.subItems?.map((sub) => (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block p-2 rounded text-[11px] transition-colors ${
                                      pathname === sub.href ? 'text-white font-semibold' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition-colors ${
                            pathname === item.href 
                              ? 'bg-accent text-foreground font-semibold' 
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold leading-none">{user.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
