import { Formik, Form as FormikForm } from "formik";
import type { FormikConfig, FormikValues } from "formik";

import { cn } from "~/lib/utils/cn";

type Props = {
  children: React.ReactNode;
};

type CategoryProps = { title?: string; actions?: React.ReactNode } & Props;

const Component = <T extends FormikValues>({
  children,
  ...rest
}: Props & FormikConfig<T>) => {
  return (
    <Formik<T> {...rest}>
      <FormikForm noValidate className="flex flex-col gap-4">
        {children}
      </FormikForm>
    </Formik>
  );
};

const Layout = ({ children }: Props) => (
  <div className="flex flex-col gap-10">{children}</div>
);

const Category = ({ title, actions, children }: CategoryProps) => (
  <div className="flex flex-col gap-4">
    <div className={cn("flex justify-between", { hidden: !title && !actions })}>
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </div>
);

const Actions = ({ children }: Props) => (
  <div className="flex justify-end gap-6">{children}</div>
);

const Row = ({ children }: Props) => (
  <div className="flex flex-col gap-6 md:flex-row">{children}</div>
);

const Col = ({ children }: Props) => (
  <div className="flex flex-col gap-6">{children}</div>
);

/**
 * These components allow me to not mess up the different
 * gaps between the different form components.
 */
export const Form = {
  Component,
  Layout,
  Category,
  Actions,
  Row,
  Col,
};
