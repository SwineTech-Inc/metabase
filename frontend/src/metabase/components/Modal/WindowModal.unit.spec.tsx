import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderWithProviders, screen } from "__support__/ui";
import {
  WindowModal,
  WindowModalProps,
} from "metabase/components/Modal/WindowModal";
import { delay } from "metabase/lib/promise";

const TestComponent = (props: WindowModalProps) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);

  return (
    <div>
      <button data-testid="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        Open
      </button>
      <WindowModal {...props} isOpen={isOpen}>
        <button data-testid={"test-inner-button-1"} />
      </WindowModal>
    </div>
  );
};

const setup = ({ modalOptions }: { modalOptions?: WindowModalProps } = {}) => {
  const windowModalProps: WindowModalProps = {
    isOpen: false,
    enableTransition: false,
    ...modalOptions,
  };
  renderWithProviders(<TestComponent {...windowModalProps} />);
};

describe("WindowModal", () => {
  it("should only display elements inside the modal when the modal is opened", async () => {
    setup();
    expect(screen.queryByTestId("test-inner-button-1")).not.toBeInTheDocument();

    userEvent.click(screen.getByTestId("toggle-button"));
    expect(screen.getByTestId("test-inner-button-1")).toBeInTheDocument();

    userEvent.click(screen.getByTestId("toggle-button"));
    expect(screen.queryByTestId("test-inner-button-1")).not.toBeInTheDocument();
  });

  it("should keep focus on the elements inside the modal when navigating with the keyboard", async () => {
    setup();

    userEvent.tab();
    expect(screen.getByTestId("toggle-button")).toHaveFocus();
    userEvent.click(screen.getByTestId("toggle-button"));

    // wait for modal to assume focus
    await delay(0);

    expect(screen.getByTestId("test-inner-button-1")).toHaveFocus();

    // ensure that focus stays within the elements in the modal,
    // even after tabbing away from the last element
    userEvent.tab();
    expect(screen.getByTestId("test-inner-button-1")).toHaveFocus();
  });
});
