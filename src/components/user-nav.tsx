import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from 'next/link';
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doctorProfile } from "@/lib/data";

export function UserNav() {
  const doctorImage = PlaceHolderImages.find(p => p.id === 'doctor-avatar');
  const { toast } = useToast();

  const handleLogout = async () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={doctorImage?.imageUrl} alt={doctorProfile.name || ''} data-ai-hint={doctorImage?.imageHint} />
            <AvatarFallback>{doctorProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{doctorProfile.name || "Doctor"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {doctorProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
