using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Models
{

    public class StandardizedFinancial
    {
        public StandardizedFinancialItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }
    }

    public class StandardizedFinancialItem
    {
        public int fiscal_year { get; set; }
        public string end_date { get; set; }
        public string start_date { get; set; }
        public string fiscal_period { get; set; }
        public string filing_date { get; set; }
    }


    public class HistoricalPrices
    {
        public HistoricalPriceItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }


    }

    public class HistoricalPriceItem
    {
        public string date { get; set; }
        public string open { get; set; }
        public string high { get; set; }
        public string low { get; set; }
        public string close { get; set; }
        public string volume { get; set; }
        public string ex_dividend { get; set; }
        public string split_ratio { get; set; }
        public string adj_open { get; set; }
        public string adj_high { get; set; }
        public string adj_low { get; set; }
        public string adj_close { get; set; }
        public string adj_volume { get; set; }

    }


    public class IncomeStatement
    {
        public IncomeStatementItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }

        public string EBIT
        {
            get
            {
                return data.Where(d => d.tag == "totaloperatingincome").First().value;
            }
        }
    }

    public class IncomeStatementItem
    {
        public string tag { get; set; }
        public string value { get; set; }
    }


    public class BalanceSheet
    {
        public BalanceSheetItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }
    }

    public class BalanceSheetItem
    {
        public string tag { get; set; }
        public string value { get; set; }
    }



    public class CashFlow
    {
        public CashFlowItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }
    }

    public class CashFlowItem
    {
        public string tag { get; set; }
        public string value { get; set; }

    }


    public class Calculation
    {
        public CalculationItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }
    }

    public class CalculationItem
    {
        public string tag { get; set; }
        public string Value { get; set; }

    }


    public class Report10K
    {
        public Report10KItem[] data { get; set; }
        public int result_count { get; set; }
        public int page_size { get; set; }
        public int current_page { get; set; }
        public int total_pages { get; set; }
        public int api_call_credits { get; set; }
    }

    public class Report10KItem
    {
        public string filing_date { get; set; }
        public string accepted_date { get; set; }
        public string period_ended { get; set; }
        public string accno { get; set; }
        public string report_type { get; set; }
        public string filing_url { get; set; }
        public string report_url { get; set; }
        public string instance_url { get; set; }
    }




    public static class URL
    {
        public static string Base()
        {
            return @"https://api.intrinio.com/";
        }
        public static string HistoricalPricesUrl(string identifier, string start_date, string end_date, string frequency)
        {
            // @"https://api.intrinio.com/prices?identifier=BBBY&start_date=2014-01-01&end_date=2017-09-03&frequency=monthly";


            return string.Format($"https://api.intrinio.com/prices?identifier={identifier}&start_date={start_date}&end_date={end_date}&frequency={frequency}");
        }

    }





}
