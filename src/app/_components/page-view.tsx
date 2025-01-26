"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
} from "@/service/customer";
import {
  createInvoiceSchema,
  useCreateInvoiceMutation,
} from "@/service/invoice";
import { useGetAllProductsQuery } from "@/service/product";
import { useGetAllProductPricesQuery } from "@/service/product-price";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  CopyIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export const PageView = () => {
  const form = useForm<z.infer<typeof createInvoiceSchema>>({
    mode: "onTouched",
    resolver: zodResolver(createInvoiceSchema),
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "invoiceItems",
    keyName: "_id",
  });

  const createInvoiceMutation = useCreateInvoiceMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    await toast
      .promise(createInvoiceMutation.mutateAsync(data), {
        loading: "Creating invoice...",
        success: "Invoice created successfully",
        error: "Failed to create invoice",
      })
      .unwrap();
  });

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
    onAddProductRow();
  };

  const getAllProductsQuery = useGetAllProductsQuery();
  const getAllProductPricesQuery = useGetAllProductPricesQuery();

  const receipt = [
    "Receipt",
    "-".repeat(32),
    "Customer: " + form.getValues("customerName"),
    "-".repeat(32),
    "Invoice Items:",
    ...(form.watch("invoiceItems")?.map((invoiceItem) => {
      const price = Number(invoiceItem.price);
      const quantity = Number(invoiceItem.quantity);
      const total = price * quantity;

      return `${invoiceItem.productName} Rp. ${price.toLocaleString()} x ${quantity.toLocaleString()} = Rp. ${total.toLocaleString()}`;
    }) ?? []),
    "-".repeat(32),
    "Total: Rp. " +
      form
        .watch("invoiceItems")
        ?.reduce(
          (acc, invoiceItem) =>
            acc + Number(invoiceItem.price) * Number(invoiceItem.quantity),
          0,
        )
        .toLocaleString(),
  ].join("\n");

  const onAddProductRow = () =>
    fieldArray.append({
      productName: "",
      price: 0,
      quantity: 0,
    });

  return (
    <main className="container max-w-screen-lg">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice</CardTitle>
              <CardDescription>
                <TypographyMuted>
                  Please fill in the details below to create an invoice
                </TypographyMuted>
              </CardDescription>
            </CardHeader>
          </Card>

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
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
                            <CommandEmpty>
                              <TypographyMuted className="mb-4">
                                No customer found
                              </TypographyMuted>

                              <Button
                                variant="outline"
                                onClick={onCreateCustomer}
                                disabled={!searchCustomerName}
                              >
                                {searchCustomerName
                                  ? `Create customer: ${searchCustomerName}`
                                  : "Please type a customer name first"}
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {getAllCustomersQuery.data?.data.map(
                                (customer) => (
                                  <CommandItem
                                    value={customer.name}
                                    key={customer.id}
                                    onSelect={() => {
                                      form.setValue("customerId", customer.id);

                                      form.setValue(
                                        "customerName",
                                        customer.name,
                                      );

                                      form.setValue("invoiceItems", []);

                                      onAddProductRow();
                                    }}
                                  >
                                    {customer.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        customer.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ),
                              )}
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

          <Card>
            {fieldArray.fields.length <= 0 && (
              <CardHeader>
                <TypographyMuted className="text-center">
                  Please add at least one product
                </TypographyMuted>
              </CardHeader>
            )}

            {fieldArray.fields.map((field, index) => (
              <React.Fragment key={field._id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.productName`}
                      render={({ field }) => (
                        <FormItem className="w-full md:max-w-[250px]">
                          <FormLabel>Product</FormLabel>

                          <div className="flex flex-row gap-2 space-y-0">
                            <Popover>
                              <div>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <SearchIcon />
                                  </Button>
                                </PopoverTrigger>
                              </div>
                              <PopoverContent className="p-0">
                                <Command>
                                  <CommandInput />
                                  <CommandList>
                                    <CommandEmpty>
                                      No product found
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {getAllProductsQuery.data?.data.map(
                                        (product) => (
                                          <CommandItem
                                            key={product.id}
                                            onSelect={() => {
                                              form.setValue(
                                                `invoiceItems.${index}.productId`,
                                                product.id,
                                              );

                                              form.setValue(
                                                `invoiceItems.${index}.productName`,
                                                product.name,
                                              );

                                              form.setValue(
                                                `invoiceItems.${index}.price`,
                                                getAllProductPricesQuery.data?.data.find(
                                                  (price) =>
                                                    price.productId ===
                                                      product.id &&
                                                    price.customerId ===
                                                      form.getValues(
                                                        "customerId",
                                                      ),
                                                )?.price ?? 0,
                                              );
                                            }}
                                          >
                                            {product.name}
                                            <Check
                                              className={cn(
                                                "ml-auto",
                                                product.id === field.value
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />
                                          </CommandItem>
                                        ),
                                      )}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="w-full md:max-w-[250px]">
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-full md:max-w-[250px]">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormItem>
                        <FormLabel>&nbsp;</FormLabel>
                        <FormControl>
                          <div className="block">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => fieldArray.remove(index)}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                </CardContent>

                <Separator className="my-4" />
              </React.Fragment>
            ))}

            <CardFooter className="justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!form.getValues("customerId")}
                onClick={onAddProductRow}
              >
                <PlusIcon />
                Add product
              </Button>

              <Button
                type="submit"
                isLoading={
                  form.formState.isSubmitting || createInvoiceMutation.isPending
                }
              >
                Save
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CardTitle className="flex flex-row items-center justify-between">
                <div>Receipt</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(receipt);
                      toast.success("Copied to clipboard");
                    } catch (error) {
                      console.error(error);
                      toast.error("Failed to copy to clipboard");
                    }
                  }}
                >
                  <CopyIcon />
                </Button>
              </CardTitle>

              <section className="whitespace-pre-wrap font-mono">
                {receipt}
              </section>
            </CardContent>
          </Card>
        </form>
      </Form>
    </main>
  );
};
