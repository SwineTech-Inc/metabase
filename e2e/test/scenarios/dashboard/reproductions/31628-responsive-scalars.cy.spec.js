import {
  cypressWaitAll,
  openNavigationSidebar,
  popover,
  restore,
  visitDashboard,
} from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const CARDS = [
  { size_x: 6, size_y: 4, row: 0, col: 0 },
  { size_x: 6, size_y: 3, row: 4, col: 0 },
  { size_x: 6, size_y: 2, row: 7, col: 0 },

  { size_x: 5, size_y: 4, row: 0, col: 6 },
  { size_x: 5, size_y: 3, row: 4, col: 6 },
  { size_x: 5, size_y: 2, row: 7, col: 6 },

  { size_x: 4, size_y: 4, row: 0, col: 11 },
  { size_x: 4, size_y: 3, row: 4, col: 11 },
  { size_x: 4, size_y: 2, row: 7, col: 11 },

  { size_x: 3, size_y: 4, row: 0, col: 15 },
  { size_x: 3, size_y: 3, row: 4, col: 15 },
  { size_x: 3, size_y: 2, row: 7, col: 15 },

  { size_x: 2, size_y: 4, row: 0, col: 18 },
  { size_x: 2, size_y: 3, row: 4, col: 18 },
  { size_x: 2, size_y: 2, row: 7, col: 18 },
];

const CARDS_SIZE_1X = [
  { size_x: 1, size_y: 4, row: 0, col: 20 },
  { size_x: 1, size_y: 3, row: 4, col: 20 },
  { size_x: 1, size_y: 2, row: 7, col: 20 },

  { size_x: 6, size_y: 1, row: 9, col: 0 },
  { size_x: 5, size_y: 1, row: 9, col: 6 },
  { size_x: 4, size_y: 1, row: 9, col: 11 },
  { size_x: 3, size_y: 1, row: 9, col: 15 },
  { size_x: 2, size_y: 1, row: 9, col: 18 },
  { size_x: 1, size_y: 1, row: 9, col: 20 },
];

const VIEWPORTS = [
  { width: 375, height: 667, openSidebar: false },
  { width: 820, height: 800, openSidebar: true },
  { width: 820, height: 800, openSidebar: false },
  { width: 1200, height: 800, openSidebar: true },
  { width: 1440, height: 800, openSidebar: true },
  { width: 1440, height: 800, openSidebar: false },
];

const SCALAR_QUESTION = {
  name: "31628 Question - This is a rather lengthy question name",
  description: "This is a rather lengthy question description",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
  },
  display: "scalar",
};

const SCALAR_QUESTION_CARDS = [...CARDS, ...CARDS_SIZE_1X];

const SMART_SCALAR_QUESTION = {
  name: "31628 Question - This is a rather lengthy question name",
  description: "This is a rather lengthy question description",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [
      [
        "field",
        ORDERS.CREATED_AT,
        {
          "base-type": "type/DateTime",
          "temporal-unit": "month",
        },
      ],
    ],
  },
  display: "smartscalar",
};

const SMART_SCALAR_QUESTION_CARDS = CARDS;

describe("issue 31628", () => {
  describe("display: scalar", () => {
    const descendantsSelector = [
      "[data-testid='scalar-value']",
      "[data-testid='scalar-title']",
      "[data-testid='scalar-description']",
    ].join(",");

    VIEWPORTS.forEach(({ width, height, openSidebar }) => {
      describe(`${width}x${height} - sidebar ${
        openSidebar ? "open" : "closed"
      }`, () => {
        beforeEach(() => {
          restore();
          cy.viewport(width, height);
          cy.signInAsAdmin();
          setupDashboardWithQuestionInCards(
            SCALAR_QUESTION,
            SCALAR_QUESTION_CARDS,
          );

          if (openSidebar) {
            openNavigationSidebar();
          }
        });

        it(`should render descendants of a 'scalar' without overflowing it (metabase#31628)`, () => {
          assertDescendantsNotOverflowDashcards(descendantsSelector);
        });
      });
    });

    describe("1x2 card", () => {
      beforeEach(() => {
        restore();
        cy.signInAsAdmin();
        setupDashboardWithQuestionInCards(SCALAR_QUESTION, [
          { size_x: 1, size_y: 2, row: 0, col: 0 },
        ]);
      });

      it("should show value tooltip on hover", () => {
        cy.findByTestId("scalar-value").realHover();

        popover().within(() => {
          cy.contains("18,760").should("exist");
        });
      });

      it("should show  ellipsis icon with question name in tooltip", () => {
        cy.findByTestId("scalar-title-icon").realHover();

        popover().within(() => {
          cy.contains(SCALAR_QUESTION.name).should("exist");
        });
      });
    });
    describe("2x2 card", () => {
      beforeEach(() => {
        restore();
        cy.signInAsAdmin();
        setupDashboardWithQuestionInCards(SCALAR_QUESTION, [
          { size_x: 2, size_y: 2, row: 0, col: 0 },
        ]);
      });

      it("should not show value tooltip on hover", () => {
        cy.findByTestId("scalar-value").realHover();

        cy.findByRole("tooltip").should("not.exist");
      });

      it("should not show ellipsis icon for title", () => {
        cy.findByTestId("scalar-title-icon").should("not.exist");
      });

      it("should show title tooltip on hover", () => {
        cy.findByTestId("scalar-title").realHover();

        popover().within(() => {
          cy.contains(SCALAR_QUESTION.name).should("exist");
        });
      });

      it("should show description tooltip on hover", () => {
        cy.findByTestId("scalar-description").realHover();

        popover().within(() => {
          cy.contains(SCALAR_QUESTION.description).should("exist");
        });
      });
    });

    describe("5x3 card", () => {
      beforeEach(() => {
        restore();
        cy.signInAsAdmin();
        setupDashboardWithQuestionInCards(SCALAR_QUESTION, [
          { size_x: 6, size_y: 3, row: 0, col: 0 },
        ]);
      });

      it("should not show value tooltip on hover", () => {
        cy.findByTestId("scalar-value").realHover();

        cy.findByRole("tooltip").should("not.exist");
      });

      it("should not show ellipsis icon for title", () => {
        cy.findByTestId("scalar-title-icon").should("not.exist");
      });

      it("should not show title tooltip on hover", () => {
        cy.findByTestId("scalar-title").realHover();

        cy.findByRole("tooltip").should("not.exist");
      });

      it("should show description tooltip on hover", () => {
        cy.findByTestId("scalar-description").realHover();

        popover().within(() => {
          cy.contains(SCALAR_QUESTION.description).should("exist");
        });
      });
    });
  });

  describe("display: smartscalar", () => {
    const descendantsSelector = [
      "[data-testid='scalar-value']",
      "[data-testid='scalar-title']",
      "[data-testid='scalar-description']",
      "[data-testid='scalar-previous-value']",
    ].join(",");

    VIEWPORTS.forEach(({ width, height, openSidebar }) => {
      describe(`${width}x${height} - sidebar ${
        openSidebar ? "open" : "closed"
      }`, () => {
        beforeEach(() => {
          restore();
          cy.viewport(width, height);
          cy.signInAsAdmin();
          setupDashboardWithQuestionInCards(
            SMART_SCALAR_QUESTION,
            SMART_SCALAR_QUESTION_CARDS,
          );

          if (openSidebar) {
            openNavigationSidebar();
          }
        });

        it(`should render descendants of a 'smartscalar' without overflowing it (metabase#31628)`, () => {
          assertDescendantsNotOverflowDashcards(descendantsSelector);
        });
      });
    });
  });

  describe("2x2 card", () => {
    beforeEach(() => {
      restore();
      cy.signInAsAdmin();
      setupDashboardWithQuestionInCards(SMART_SCALAR_QUESTION, [
        { size_x: 2, size_y: 2, row: 0, col: 0 },
      ]);
    });

    it("should not show value tooltip on hover", () => {
      cy.findByTestId("scalar-value").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });

    it("should show title tooltip on hover", () => {
      cy.findByTestId("scalar-title").realHover();

      popover().within(() => {
        cy.contains(SMART_SCALAR_QUESTION.name).should("exist");
      });
    });

    it("should show description tooltip on hover", () => {
      cy.findByTestId("scalar-description").realHover();

      popover().within(() => {
        cy.contains(SMART_SCALAR_QUESTION.description).should("exist");
      });
    });

    it("should show previous value as a percentage only", () => {
      const previousValue = cy.findByTestId("scalar-previous-value");

      previousValue.within(() => {
        cy.contains("34.72%").should("exist");
        cy.contains("• was 527 last month").should("not.exist");
      });
    });

    it("should show previous value as a percentage only up to 1 decimal place (1200x600)", () => {
      cy.viewport(1200, 600);

      const previousValue = cy.findByTestId("scalar-previous-value");

      previousValue.within(() => {
        cy.contains("34.7%").should("exist");
        cy.contains("34.72%").should("not.exist");
        cy.contains("• was 527 last month").should("not.exist");
      });
    });

    it("should show previous value as a percentage without decimal places (1000x600)", () => {
      cy.viewport(1000, 600);

      const previousValue = cy.findByTestId("scalar-previous-value");

      previousValue.within(() => {
        cy.contains("35%").should("exist");
        cy.contains("34.72%").should("not.exist");
        cy.contains("• was 527 last month").should("not.exist");
      });
    });

    it("should show previous value tooltip on hover", () => {
      cy.findByTestId("scalar-previous-value").realHover();

      popover().within(() => {
        cy.contains("34.72%").should("exist");
        cy.contains("• was 527 last month").should("exist");
      });
    });
  });

  describe("6x3 card", () => {
    beforeEach(() => {
      restore();
      cy.signInAsAdmin();
      setupDashboardWithQuestionInCards(SMART_SCALAR_QUESTION, [
        { size_x: 6, size_y: 3, row: 0, col: 0 },
      ]);
    });
    it("should not show value tooltip on hover", () => {
      cy.findByTestId("scalar-value").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });

    it("should show title tooltip on hover", () => {
      cy.findByTestId("scalar-title").realHover();

      popover().within(() => {
        cy.contains(SMART_SCALAR_QUESTION.name).should("exist");
      });
    });

    it("should show description tooltip on hover", () => {
      cy.findByTestId("scalar-description").realHover();

      popover().within(() => {
        cy.contains(SMART_SCALAR_QUESTION.description).should("exist");
      });
    });

    it("should show previous value as a percentage only", () => {
      const previousValue = cy.findByTestId("scalar-previous-value");

      previousValue.within(() => {
        cy.contains("34.72%").should("exist");
        cy.contains("• was 527 last month").should("exist");
      });
    });

    it("should not show previous value tooltip on hover", () => {
      cy.findByTestId("scalar-previous-value").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });
  });

  describe("6x4 card", () => {
    beforeEach(() => {
      restore();
      cy.signInAsAdmin();
      setupDashboardWithQuestionInCards(SMART_SCALAR_QUESTION, [
        { size_x: 6, size_y: 4, row: 0, col: 0 },
      ]);
    });
    it("should not show value tooltip on hover", () => {
      cy.findByTestId("scalar-value").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });

    it("should not show title tooltip on hover", () => {
      cy.findByTestId("scalar-title").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });

    it("should show description tooltip on hover", () => {
      cy.findByTestId("scalar-description").realHover();

      popover().within(() => {
        cy.contains(SMART_SCALAR_QUESTION.description).should("exist");
      });
    });

    it("should show previous value as a percentage only", () => {
      const previousValue = cy.findByTestId("scalar-previous-value");

      previousValue.within(() => {
        cy.contains("34.72%").should("exist");
        cy.contains("• was 527 last month").should("exist");
      });
    });

    it("should not show previous value tooltip on hover", () => {
      cy.findByTestId("scalar-previous-value").realHover();

      cy.findByRole("tooltip").should("not.exist");
    });
  });
});

const setupDashboardWithQuestionInCards = (question, cards) => {
  cy.createDashboard().then(({ body: dashboard }) => {
    cypressWaitAll(
      cards.map(card => {
        return cy.createQuestionAndAddToDashboard(question, dashboard.id, card);
      }),
    );

    visitDashboard(dashboard.id);
  });
};

const assertDescendantsNotOverflowDashcards = descendantsSelector => {
  cy.findAllByTestId("dashcard").each((dashcard, dashcardIndex) => {
    const descendants = dashcard.find(descendantsSelector);

    descendants.each((_descendantIndex, descendant) => {
      assertDescendantNotOverflowsContainer(
        descendant,
        dashcard[0],
        `dashcard[${dashcardIndex}] [data-testid="${descendant.dataset.testid}"]`,
      );
    });
  });
};

const assertDescendantNotOverflowsContainer = (
  descendant,
  container,
  message,
) => {
  const containerRect = container.getBoundingClientRect();
  const descendantRect = descendant.getBoundingClientRect();

  if (descendantRect.height === 0 || descendantRect.width === 0) {
    return;
  }

  expect(descendantRect.bottom, `${message} bottom`).to.be.lte(
    containerRect.bottom,
  );
  expect(descendantRect.top, `${message} top`).to.be.gte(containerRect.top);
  expect(descendantRect.left, `${message} left`).to.be.gte(containerRect.left);
  expect(descendantRect.right, `${message} right`).to.be.lte(
    containerRect.right,
  );
};
