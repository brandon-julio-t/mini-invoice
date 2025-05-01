import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
} from "@/service/customer";
import { type createInvoiceSchema } from "@/service/invoice";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import React from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const CustomerFormSection: React.ComponentType<{
  form: UseFormReturn<z.infer<typeof createInvoiceSchema>>;
  onCustomerSelected: () => void;
}> = ({ form, onCustomerSelected }) => {
  const [searchCustomerName, setSearchCustomerName] = React.useState("");
  const getAllCustomersQuery = useGetAllCustomersQuery({
    q: searchCustomerName,
  });

  const createCustomerMutation = useCreateCustomerMutation();
  const onCreateCustomer = async () => {
    const response = await toast
      .promise(
        createCustomerMutation.mutateAsync({
          name: searchCustomerName,
        }),
        {
          loading: "Creating customer...",
          success: "Customer created successfully",
          error: "Failed to create customer",
        },
      )
      .unwrap();

    setSearchCustomerName("");

    form.setValue("customerId", response.data.id);
    form.setValue("customerName", response.data.name);
    form.setValue("invoiceItems", []);

    onCustomerSelected();
  };

  return (
    <Card>
      <CardHeader>
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>

              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? getAllCustomersQuery.data?.data.find(
                            (customer) => customer.id === field.value,
                          )?.name
                        : "Select customer"}
                      <ChevronsUpDown className="ml-auto opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      value={searchCustomerName}
                      onInput={(e) => {
                        setSearchCustomerName(e.currentTarget.value);
                      }}
                      placeholder="Search customer..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty className="px-6">
                        {searchCustomerName ? (
                          <Button
                            variant="outline"
                            onClick={onCreateCustomer}
                            disabled={!searchCustomerName}
                          >
                            Add &quot;{searchCustomerName}&quot;
                          </Button>
                        ) : (
                          <TypographyMuted>
                            No customer found.
                            <br />
                            Type a customer name to add them.
                          </TypographyMuted>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {getAllCustomersQuery.data?.data.map((customer) => (
                          <CommandItem
                            value={customer.name}
                            key={customer.id}
                            onSelect={() => {
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
                            <CheckIcon
                              className={cn(
                                customer.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {customer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardHeader>
    </Card>
  );
};
