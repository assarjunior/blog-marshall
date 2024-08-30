import { SubmitButton } from "@/app/components/dashboard/SubmitButtons";
import { PricingTable } from "@/app/components/shared/Pricing";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";
import { stripe } from "@/app/utils/stripe";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

async function getData(userId: string) {
  const data = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      status: true,
      User: {
        select: {
          customerId: true,
        },
      },
    },
  });
  return data;
}

export default async function PricingList() {
  const user = await requireUser();
  const data = await getData(user.id);

  async function createCustomerPortal() {
    "use server";

    const session = await stripe.billingPortal.sessions.create({
      customer: data?.User?.customerId as string,
      return_url: "http://localhost:3000/dashboard/pricing",
    });

    return redirect(session.url)
  }

  if (data?.status === "active") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Subscription</CardTitle>
          <CardDescription>
            CLick on the button below, this will give you the opportunity to
            change your payment details and view your invoices and the same time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerPortal}>
            <SubmitButton text="view Subscription Details" />
          </form>
        </CardContent>
      </Card>
    );
  }
  return (
    <div>
      <PricingTable />
    </div>
  );
}
