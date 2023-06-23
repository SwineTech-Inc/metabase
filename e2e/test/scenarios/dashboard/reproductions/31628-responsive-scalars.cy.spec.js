import { cypressWaitAll, restore, visitDashboard } from "e2e/support/helpers";

import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

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

const SCALAR_QUESTION = {
  name: "31628 Question - This is a rather lengthy question name",
  description: "This is a rather lengthy question description",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
  },
  display: "scalar",
};

const cards = [
  { size_x: 2, size_y: 2, row: 0, col: 0 },
  { size_x: 2, size_y: 3, row: 2, col: 0 },
  { size_x: 2, size_y: 4, row: 5, col: 0 },
  { size_x: 2, size_y: 5, row: 9, col: 0 },

  { size_x: 3, size_y: 2, row: 0, col: 2 },
  { size_x: 3, size_y: 3, row: 2, col: 2 },
  { size_x: 3, size_y: 4, row: 5, col: 2 },
  { size_x: 3, size_y: 5, row: 9, col: 2 },

  { size_x: 4, size_y: 2, row: 0, col: 5 },
  { size_x: 4, size_y: 3, row: 2, col: 5 },
  { size_x: 4, size_y: 4, row: 5, col: 5 },
  { size_x: 4, size_y: 5, row: 9, col: 5 },

  { size_x: 5, size_y: 2, row: 0, col: 9 },
  { size_x: 5, size_y: 3, row: 2, col: 9 },
  { size_x: 5, size_y: 4, row: 5, col: 9 },
  { size_x: 5, size_y: 5, row: 9, col: 9 },

  { size_x: 6, size_y: 2, row: 0, col: 14 },
  { size_x: 6, size_y: 3, row: 2, col: 14 },
  { size_x: 6, size_y: 4, row: 5, col: 14 },
  { size_x: 6, size_y: 5, row: 9, col: 14 },
];

describe("issue 31628", () => {
  describe("display: scalar", () => {
    beforeEach(() => {
      restore();
      cy.signInAsAdmin();

      cy.createDashboard().then(({ body: dashboard }) => {
        cypressWaitAll(
          cards.map(card => {
            return cy.createQuestionAndAddToDashboard(
              SCALAR_QUESTION,
              dashboard.id,
              card,
            );
          }),
        );

        visitDashboard(dashboard.id);
      });
    });

    it("should render children of smartscalar without overflowing it (metabase#31628)", () => {
      cy.findAllByTestId("dashcard").each(dashcard => {
        const descendants = dashcard.find(
          [
            "[data-testid='scalar-value']",
            "[data-testid='scalar-title']",
            "[data-testid='scalar-description']",
          ].join(","),
        );
        const visibleDescendants = descendants.filter((_index, descendant) => {
          const descendantRect = descendant.getBoundingClientRect();
          return descendantRect.width > 0 && descendantRect.height > 0;
        });

        visibleDescendants.each((_index, descendant) => {
          assertDescendantNotOverflowsContainer(descendant, dashcard[0]);
        });
      });
    });
  });
  describe("display: smartscalar", () => {
    beforeEach(() => {
      restore();
      cy.signInAsAdmin();

      cy.createDashboard().then(({ body: dashboard }) => {
        cypressWaitAll(
          cards.map(card => {
            return cy.createQuestionAndAddToDashboard(
              SMART_SCALAR_QUESTION,
              dashboard.id,
              card,
            );
          }),
        );

        visitDashboard(dashboard.id);
      });
    });

    it("should render children of smartscalar without overflowing it (metabase#31628)", () => {
      cy.findAllByTestId("dashcard").each(dashcard => {
        const descendants = dashcard.find(
          [
            "[data-testid='scalar-value']",
            "[data-testid='scalar-title']",
            "[data-testid='scalar-description']",
            "[data-testid='scalar-previous-value']",
          ].join(","),
        );
        const visibleDescendants = descendants.filter((_index, descendant) => {
          const descendantRect = descendant.getBoundingClientRect();
          return descendantRect.width > 0 && descendantRect.height > 0;
        });

        visibleDescendants.each((_index, descendant) => {
          assertDescendantNotOverflowsContainer(descendant, dashcard[0]);
        });
      });
    });
  });
});

const assertDescendantNotOverflowsContainer = (descendant, container) => {
  const containerRect = container.getBoundingClientRect();
  const descendantRect = descendant.getBoundingClientRect();

  expect(descendantRect.bottom).to.lte(containerRect.bottom);
  expect(descendantRect.top).to.gte(containerRect.top);
  expect(descendantRect.left).to.gte(containerRect.left);
  expect(descendantRect.right).to.lte(containerRect.right);
};
