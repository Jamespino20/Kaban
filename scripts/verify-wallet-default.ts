import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.AGAPAYSTORAGE_POSTGRES_URL_NON_POOLING ||
  process.env.AGAPAYSTORAGE_POSTGRES_URL ||
  process.env.AGAPAYSTORAGE_DATABASE_URL_UNPOOLED ||
  process.env.AGAPAYSTORAGE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing database connection string.");
}

const pool = new Pool({ connectionString });

async function main() {
  const accountSummary = await pool.query(`
    select account_type, count(*)::int as count
    from savings_accounts
    group by account_type
    order by account_type
  `);

  const defaultSummary = await pool.query(`
    select
      (select count(*)::int from loans where status = 'defaulted') as defaulted_loans,
      (select count(*)::int from loans where coalesce(is_recovery_loan, false) = true) as recovery_loans,
      (select count(*)::int from loan_guarantees where status = 'charged') as charged_guarantees
  `);

  const liabilityProducts = await pool.query(`
    select product_id, name, guarantor_liability_rate
    from loan_products
    order by product_id
    limit 8
  `);

  const enforcementCandidates = await pool.query(`
    select
      l.loan_id,
      l.loan_reference,
      l.status,
      l.balance_remaining,
      lp.guarantor_liability_rate,
      up.first_name,
      up.last_name,
      array_agg(distinct lg.status) as guarantee_statuses,
      min(ls.due_date) as oldest_overdue_due_date
    from loans l
    join loan_products lp on lp.product_id = l.product_id
    join user_profiles up on up.user_id = l.user_id
    left join loan_guarantees lg on lg.loan_id = l.loan_id
    join loan_schedules ls on ls.loan_id = l.loan_id and ls.status = 'overdue'
    where coalesce(l.is_recovery_loan, false) = false
      and l.status in ('active', 'defaulted')
      and l.balance_remaining > 0
      and ls.due_date <= current_date - interval '14 day'
    group by
      l.loan_id,
      l.loan_reference,
      l.status,
      l.balance_remaining,
      lp.guarantor_liability_rate,
      up.first_name,
      up.last_name
    having bool_or(lg.status in ('pending', 'vouched'))
    order by l.loan_id
    limit 5
  `);

  console.log(
    JSON.stringify(
      {
        accountSummary: accountSummary.rows,
        defaultSummary: defaultSummary.rows[0],
        liabilityProducts: liabilityProducts.rows,
        enforcementCandidates: enforcementCandidates.rows,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
