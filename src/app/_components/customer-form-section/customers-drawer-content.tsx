import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
} from "@/service/customer";
import { type createInvoiceSchema } from "@/service/invoice";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, SearchIcon } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const CustomersDrawerContent: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  selectedCustomerId: string;
  onCustomerSelected: () => void;
}> = ({ form, selectedCustomerId, onCustomerSelected }) => {
  const [searchCustomerName, setSearchCustomerName] = React.useState("");
  const deferredSearch = React.useDeferredValue(searchCustomerName);
  const getAllCustomersQuery = useGetAllCustomersQuery({
    q: deferredSearch,
  });
  const customers = getAllCustomersQuery.data?.data ?? [];

  const createCustomerMutation = useCreateCustomerMutation();
  const onCreateCustomer = async () => {
    const response = await toast
      .promise(
        createCustomerMutation.mutateAsync({
          name: searchCustomerName,
        }),
        {
          loading: `Creating customer "${searchCustomerName}"...`,
          success: `Customer "${searchCustomerName}" created successfully`,
          error: `Failed to create customer "${searchCustomerName}"`,
        },
      )
      .unwrap();

    setSearchCustomerName("");

    form.setValue("customerId", response.data.id);
    form.setValue("customerName", response.data.name);
    form.setValue("invoiceItems", []);

    onCustomerSelected();
  };

  // The scrollable element for your list
  const parentRef = React.useRef(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
  });

  return (
    <React.Fragment>
      <div className="relative mx-2">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-(--text-base) -translate-y-1/2" />
        <Input
          className="pl-8"
          type="search"
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
          placeholder="Search customer..."
        />
      </div>

      {customers.length <= 0 && (
        <div className="mt-2 px-2">
          {searchCustomerName ? (
            <Button
              variant="outline"
              onClick={onCreateCustomer}
              className="w-full"
            >
              Add &quot;{searchCustomerName}&quot;
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onCreateCustomer}
              className="w-full"
              disabled
            >
              No customers found
            </Button>
          )}
        </div>
      )}

      {/* The scrollable element for your list */}
      <div
        ref={parentRef}
        className="pt-2"
        style={{
          height: `60vh`,
          overflowY: "auto", // Make it scroll!
        }}
      >
        {/* The large inner element to hold all of the items */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Only the visible items in the virtualizer, manually positioned to be in view */}
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const customer = customers[virtualItem.index];
            if (!customer) {
              return null;
            }

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    form.setValue("customerId", customer.id, {
                      shouldValidate: true,
                    });
                    form.setValue("customerName", customer.name, {
                      shouldValidate: true,
                    });
                    form.setValue("invoiceItems", [], {
                      shouldValidate: true,
                    });
                    onCustomerSelected();
                  }}
                >
                  {customer.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      customer.id === selectedCustomerId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};
