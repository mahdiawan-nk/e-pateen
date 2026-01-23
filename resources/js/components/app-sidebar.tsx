import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, User, Box, Layers, Fish, FileText } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavGroup, type NavItem } from '@/types';

import AppLogo from './app-logo';


const mainNavItems: NavGroup[] = [
    {
        title: 'Dashboard',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
                roles: ['administrator', 'pembudidaya'],
            },
        ],
    },
    {
        title: 'Management User',
        items: [
            {
                title: 'User',
                href: '/users',
                icon: User,
                roles: ['administrator'],
            },
        ],
    },
    {
        title: 'Management Budidaya',
        items: [
            {
                title: 'Data Kolam',
                href: '/kolams',
                icon: Box,
                roles: ['administrator', 'pembudidaya'],
                children: [
                    {
                        title: 'Form Kolam',
                        href: '/kolams/create',
                    },
                    {
                        title: 'Data Kolam',
                        href: '/kolams',
                    },
                    {
                        title: 'Histori Kolam',
                        href: '/kolams/history-all',
                    },
                ]
            },
            {
                title: 'Monitoring Kolam',
                href: '/kolam-monitoring',
                roles: ['administrator', 'pembudidaya'],
                icon: Box,
            },
            {
                title: 'Jadwal Kelola Kolam',
                href: '/schedules',
                roles: ['administrator', 'pembudidaya'],
                icon: Box,
            },
            {
                title: 'Siklus Budidaya',
                href: 'https://github.com/laravel/react-starter-kit',
                icon: Fish,
                roles: ['administrator', 'pembudidaya'],
                children: [
                    {
                        title: 'Penebaran Benih',
                        href: '/kolam-seeding',
                    },
                    {
                        title: 'Pemberian Pakan',
                        href: '/kolam-feeding',
                    },
                    {
                        title: 'Sampling Pertumbuhan',
                        href: '/kolam-sampling',
                    },
                ],
            },
            {
                title: 'Data Panen',
                href: 'https://github.com/laravel/react-starter-kit',
                icon: Box,
                roles: ['administrator', 'pembudidaya'],
                children: [
                    {
                        title: 'Estimasi Panen',
                        href: '/harvest/estimation',
                    },
                    {
                        title: 'Realisasi Panen',
                        href: '/harvest/realization',
                    },
                ],
            },
            {
                title: 'Reports',
                href: '/reports',
                icon: FileText,
                roles: ['pembudidaya','administrator'],
            },
        ],
    },
];




export function AppSidebar() {

    const { auth } = usePage<{ auth: { user: { role: string } } }>().props
    const role = auth?.user?.role ?? ''

    interface FilteredNavItem extends NavItem {
        children?: FilteredNavItem[];
    }

    function filterByRole(items: NavItem[], role: string): FilteredNavItem[] {
        return items
            .filter((item: NavItem) => !item.roles || item.roles.includes(role))
            .map((item: NavItem): FilteredNavItem => ({
                ...item,
                children: item.children
                    ? filterByRole(item.children as NavItem[], role)
                    : undefined,
            }))
            .filter((item: FilteredNavItem) => !item.children || item.children.length > 0);
    }

    const filteredNav = mainNavItems.map(group => ({
        ...group,
        items: filterByRole(group.items, role),
    }))
        .filter(group => group.items.length > 0)
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={filteredNav} />
            </SidebarContent>
        </Sidebar>
    );
}
