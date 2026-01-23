import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import { useActiveUrl } from '@/hooks/use-active-url';
import { NavGroup, NavItem } from '@/types';
import { useState } from 'react';

/* ---------------------------------- */
/* MAIN */
/* ---------------------------------- */

export function NavMain({ groups }: { groups: NavGroup[] }) {
    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.title}
                    </SidebarGroupLabel>

                    <SidebarMenu>
                        {group.items.map((item) => (
                            <NavItemNode key={item.title} item={item} />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}

/* ---------------------------------- */
/* ITEM NODE (Recursive) */
/* ---------------------------------- */

function NavItemNode({ item }: { item: NavItem }) {
    const { urlIsActive } = useActiveUrl();
    const hasChildren = !!item.children?.length;

    const isChildActive = item.children?.some((child) =>
        child.href ? urlIsActive(child.href) : false
    );

    const [open, setOpen] = useState(isChildActive);

    // 👉 ITEM WITH SUBMENU
    if (hasChildren) {
        return (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setOpen(!open)}
                        isActive={isChildActive}
                        className="justify-between"
                    >
                        <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                        </div>

                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''
                                }`}
                        />
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {open && (
                    <SidebarMenu className="ml-4 border-l pl-2">
                        {item.children!.map((child) => (
                            <NavItemNode key={child.title} item={child} />
                        ))}
                    </SidebarMenu>
                )}
            </>
        );
    }

    // 👉 ITEM NORMAL
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={item.href ? urlIsActive(item.href) : false}
                tooltip={{ children: item.title }}
            >
                <Link
                    href={item.href!}
                    prefetch
                    className="flex items-center gap-2"
                >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
