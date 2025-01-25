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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  CopyIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <main className="container">
        <Card>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
                <CardDescription>
                  <TypographyMuted>
                    Please fill in the details below to create an invoice
                  </TypographyMuted>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
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
                              <ChevronsUpDown className="opacity-50" />
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
                                        form.setValue(
                                          "customerId",
                                          customer.id,
                                        );

                                        form.setValue(
                                          "customerName",
                                          customer.name,
                                        );
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

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      <TableHead className="min-w-[200px]">Price</TableHead>
                      <TableHead className="min-w-[200px]">Quantity</TableHead>
                      <TableHead className="min-w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldArray.fields.length <= 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <TypographyMuted className="text-center">
                            Please add at least one product
                          </TypographyMuted>
                        </TableCell>
                      </TableRow>
                    )}

                    {fieldArray.fields.map((field, index) => (
                      <TableRow key={field._id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`invoiceItems.${index}.productName`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row gap-2 space-y-0">
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
                                                  field.onChange(product.id);

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

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`invoiceItems.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`invoiceItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} type="number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => fieldArray.remove(index)}
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableRow>
                      <TableCell colSpan={999}>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            fieldArray.append({
                              productName: "",
                              price: 0,
                              quantity: 0,
                            })
                          }
                        >
                          <PlusIcon />
                          Add product
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  isLoading={
                    form.formState.isSubmitting ||
                    createInvoiceMutation.isPending
                  }
                >
                  Save
                </Button>
              </CardFooter>

              <Separator />

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
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

interface Customer {
  id: string;
  name: string;
}

interface GetAllCustomersQueryParams {
  q: string;
}

const useGetAllCustomersQuery = (params: GetAllCustomersQueryParams) => {
  return useQuery({
    queryKey: ["customers", params.q],
    queryFn: async () => {
      const customers = JSON.parse(
        localStorage.getItem("customers") ?? "[]",
      ) as Customer[];

      const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(params.q.toLowerCase()),
      );

      return { data: filteredCustomers };
    },
  });
};

const createCustomerSchema = z.object({
  name: z.string(),
});

const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createCustomerSchema>) => {
      const customers = JSON.parse(
        localStorage.getItem("customers") ?? "[]",
      ) as Customer[];

      const createdCustomer = {
        id: nanoid(),
        name: params.name,
      } satisfies Customer;

      customers.push(createdCustomer);

      localStorage.setItem("customers", JSON.stringify(customers));

      return { data: createdCustomer };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

interface Product {
  id: string;
  name: string;
}

const useGetAllProductsQuery = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      return { data: products };
    },
  });
};

const createProductSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  price: z.number(),
});

const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  const upsertProductPriceMutation = useUpsertProductPriceMutation();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createProductSchema>) => {
      const products = JSON.parse(
        localStorage.getItem("products") ?? "[]",
      ) as Product[];

      const createdProduct = {
        id: nanoid(),
        name: params.name,
      } satisfies Product;

      products.push(createdProduct);

      localStorage.setItem("products", JSON.stringify(products));

      await upsertProductPriceMutation.mutateAsync({
        productId: createdProduct.id,
        customerId: params.customerId,
        price: params.price,
      });

      return { data: createdProduct };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
    },
  });
};

interface ProductPrice {
  id: string;
  productId: string;
  customerId: string;
  price: number;
}

const useGetAllProductPricesQuery = () => {
  return useQuery({
    queryKey: ["productPrices"],
    queryFn: async () => {
      const productPrices = JSON.parse(
        localStorage.getItem("productPrices") ?? "[]",
      ) as ProductPrice[];

      return { data: productPrices };
    },
  });
};

const upsertProductPriceSchema = z.object({
  productId: z.string(),
  customerId: z.string(),
  price: z.number(),
});

const useUpsertProductPriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof upsertProductPriceSchema>) => {
      const productPrices = JSON.parse(
        localStorage.getItem("productPrices") ?? "[]",
      ) as ProductPrice[];

      let existingProductPrice = productPrices.find(
        (productPrice) =>
          productPrice.productId === params.productId &&
          productPrice.customerId === params.customerId,
      );

      if (existingProductPrice) {
        existingProductPrice.price = params.price;
        localStorage.setItem("productPrices", JSON.stringify(productPrices));
      } else {
        const createdProductPrice = {
          id: nanoid(),
          productId: params.productId,
          customerId: params.customerId,
          price: params.price,
        } satisfies ProductPrice;

        productPrices.push(createdProductPrice);

        localStorage.setItem("productPrices", JSON.stringify(productPrices));

        existingProductPrice = createdProductPrice;
      }

      return { data: existingProductPrice };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
    },
  });
};

interface Invoice {
  id: string;
  customerId: string;
}

interface InvoiceItem {
  invoiceId: string;
  productId: string;
  price: number;
  quantity: number;
}

const createInvoiceSchema = z.object({
  customerId: z.string().nullish(),
  customerName: z.string(),

  invoiceItems: z.array(
    z.object({
      productId: z.string().nullish(),
      productName: z.string(),
      price: z.coerce.number(),
      quantity: z.coerce.number(),
    }),
  ),
});

const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  const createCustomerMutation = useCreateCustomerMutation();
  const createProductMutation = useCreateProductMutation();
  const upsertProductPriceMutation = useUpsertProductPriceMutation();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createInvoiceSchema>) => {
      const { customerName } = params;
      let customerId = params.customerId;
      if (!customerId) {
        const createdCustomer = await createCustomerMutation.mutateAsync({
          name: customerName,
        });

        customerId = createdCustomer.data.id;
      }

      const invoices = JSON.parse(
        localStorage.getItem("invoices") ?? "[]",
      ) as Invoice[];

      const createdInvoice = {
        id: nanoid(),
        customerId,
      } satisfies Invoice;

      invoices.push(createdInvoice);

      localStorage.setItem("invoices", JSON.stringify(invoices));

      const createdInvoiceItems: InvoiceItem[] = [];

      for (const invoiceItem of params.invoiceItems) {
        let productId = invoiceItem.productId;

        if (!productId) {
          const createdProduct = await createProductMutation.mutateAsync({
            name: invoiceItem.productName,
            price: invoiceItem.price,
            customerId,
          });

          productId = createdProduct.data.id;
        }

        await upsertProductPriceMutation.mutateAsync({
          productId,
          customerId,
          price: invoiceItem.price,
        });

        createdInvoiceItems.push({
          productId,
          invoiceId: createdInvoice.id,
          price: invoiceItem.price,
          quantity: invoiceItem.quantity,
        });
      }

      const invoiceItems = JSON.parse(
        localStorage.getItem("invoiceItems") ?? "[]",
      ) as InvoiceItem[];

      invoiceItems.push(...createdInvoiceItems);

      localStorage.setItem("invoiceItems", JSON.stringify(invoiceItems));

      return { data: createdInvoice };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["productPrices"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
