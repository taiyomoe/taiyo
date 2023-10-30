import {
  Formik,
  Form as FormikForm,
  type FormikConfig,
  type FormikValues,
} from "formik";

type Props = {
  children: React.ReactNode;
};

type CategoryProps = { title?: string } & Props;

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

const Category = ({ title, children }: CategoryProps) => (
  <div className="flex flex-col gap-4">
    {title && <h2 className="text-2xl font-semibold">{title}</h2>}
    <div className="flex flex-col gap-6">{children}</div>
  </div>
);

const Actions = ({ children }: Props) => (
  <div className="flex justify-end gap-6">{children}</div>
);

const Row = ({ children }: Props) => (
  <div className="flex flex-col gap-6 md:flex-row">{children}</div>
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
};
