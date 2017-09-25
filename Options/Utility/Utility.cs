using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Options.Utility
{
    public static class Utility
    {
        public static string ConvertFrom(string epochDate)
        {
            DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(epochDate));

            String friendlyDateTime = dt.ToString("MMMM dd, yyyy");

            string unixDateFromFriendlyDateTime = (DateTime.Parse(friendlyDateTime) - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds.ToString();

            return friendlyDateTime;
        }

        public static string ConvertToDateTime(string epochDate)
        {
            DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(epochDate));

            String friendlyDateTime = dt.ToString("MMMM dd, yyyy h:MM:ss tt"); //use Z instead of tt to avoid time zone conversion

            string unixDateFromFriendlyDateTime = (DateTime.Parse(friendlyDateTime) - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds.ToString();

            return friendlyDateTime;
        }

        public static DateTime GetDateTimeFrom(int epochDate)
        {
            DateTime dt = new DateTime(1970, 1, 1, 0, 0, 0).AddSeconds(Convert.ToDouble(epochDate));
            return dt;
        }



    }
}
