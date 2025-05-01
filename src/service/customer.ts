import { useMutation } from "@tanstack/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";

export interface Customer {
  id: string;
  name: string;
}

export interface GetAllCustomersQueryParams {
  q?: string;
}

export const useGetAllCustomersQuery = (
  params: GetAllCustomersQueryParams = {},
) => {
  return useQuery({
    queryKey: ["customers", params.q],
    queryFn: async () => {
      const customers = JSON.parse(
        localStorage.getItem("customers") ?? "[]",
      ) as Customer[];

      const q = params.q?.toLowerCase() ?? "";
      const filteredCustomers = q
        ? customers.filter((customer) =>
            customer.name.toLowerCase().includes(q),
          )
        : customers;

      return { data: filteredCustomers };
    },
  });
};

export const createCustomerSchema = z.object({
  name: z.string(),
});

export const useCreateCustomerMutation = () => {
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
