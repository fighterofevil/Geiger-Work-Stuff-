<?php

/*
** PHP configs.
*/
set_time_limit(300); //5 minutes
error_reporting(E_ERROR | E_PARSE);
date_default_timezone_set("America/New_York");


/*
** Database and C8 settings.
*/
$serverIP = 			'ggc8.ciw6ojegqrdb.us-east-1.rds.amazonaws.com';  //C8C1
$userID = 				'geiger_script';
$password = 			'GeiGrom';
$databasePreview = 		'previewc8prod';
$databaseProduction =	'shopc8prod';
$vendorID =				'20200204375';								// Vendor ID to use when posting an order back to C8.
$c8PreviewBase =		'https://ggc8admin.avetti.ca/preview/';	// C8C1 Preview base URL
$c8ProductionBase =		'https://tranetechnologiesbrandstore.com/';		// C8C1 Production base URL

/*
** Email configs.
*/
$emailFrom = 			'cs@geiger.com';						// Email address to send confirmations from
// $emailTo =              'psgeliteservice@geiger.com';                  // Email address to send to. If blank, emails to customer.
$emailTo = 'jpaine@geiger.com';

$emailToPreview =       'jpaine@geiger.com';                    // Email address to send to in preview environment. If blank, emails to customer.
$bccEmailRecipients = 	'';										// Put email(s) here, comma delimited, to receive a BCC copy of order confirmation
$subject = 				'{{{sitename}}} Custom Order Inquiry';	// Email subject. This will change based on the site it's coming from
$emailTemplateFile =	'./email-template.html';				// Email template file

/*
** Required Post Variables:
** ci -				Client ID of user.
** email -			Email address of user.
** 
**
** Optional Post Variables:
** e -				If present, will flag the order as a test order.
** option1 -		Item option 1.
** option2 -		Item option 2.
** option3 -		Item option 3.
** option4 -		Item option 4.
*/
$requiredParams = [
	"ci",
	"firstname",
	"lastname",
	"sitename",
	"vendorid",
	"url"
];

$requiredCookies = [
	"JSESSIONID"
];


/*
** The URL to post a Google Forms submission to.
*/
$gfURL = "https://docs.google.com/forms/d/e/1FAIpQLSd1j-2_GehE-hJf3Pfb6EVmnzlkhFNQFbxZhWlFXOqYAUsSbA/formResponse?embedded=true";

/*
** Google Forms and Email Template map.
** Translates from the form posted on C8 and MySQL data into a Google Forms submission and email template data.
** Keys are the name of the form data variables to post to Google Forms.
** Elements of each hashed value:
**  - post:	If not empty, pull the value from POST data received from the request of the given name.
**          This is processed first.
**  - customerRow:	If not empty, pull the value from the MySQL database's customer row. This will
**                  require the POST variable 'ci', which is the clientid.
**  - itemRow: If not empty, pull the value from the MySQL database's item row. This will require
**             the POST variable 'item', which is the item code.
*/
$gfFormMap = [
	"entry.834041758" =>	["post" => 			"e"],
	"entry.1220316331" =>	["post" =>			"firstname"],
	"entry.884491802" =>	["post" =>			"lastname"],
	"entry.1519573690" =>	["post" => 			"phone"],
	"entry.1779988285" =>	["post" =>			"useremail"],
	"entry.1541829093" =>	["post" => 			"brand"],
	"entry.1097575612" =>	["post" => 			"reason"],
	"entry.222084525" =>	["post" => 			"items"],
	"entry.1168580496" =>	["post" => 			"sitename"],
	"entry.1429881578" =>	["post" => 			"vendorid"],
	"entry.655990331" =>	["post" => 			"ci"],
	"entry.1608667248" =>	["customerRow" =>	"email"]
];
$emailTemplateMap = [
	"user-fname" => 		["post" =>			"firstname"],
	"user-mname" => 		["post" =>			"middlename"],
	"user-lname" => 		["post" =>			"lastname"],
	"phone" =>				["post" => 			"phone"],
	"email" =>				["post" =>			"useremail"],
	"brand" =>				["post" => 			"brand"],
	"reason" =>				["post" => 			"reason"],
	"items" =>				["post" => 			"items"]
];


/*
** Other configs.
*/
$errorsFile = 			'./errors.log';							// Log file containing error data.
$ordersFile = 			'./orders.log'; 						// Log file containing orders data.


/*
** Returns all post data in a comma-delimited format.
*/
function post_data() {
	$rtn = "";
	foreach ($_POST as $key => $value) {
		$rtn = $rtn.$key."=".$value.",";
	}
	return rtrim($rtn, ",");
}


/*
** Error logging function. Will also halt code execution with a die() call.
** @param 	$errorMsg 			Error message to log.
*/
function die_error($errorMsg) {
	$errorData  = date("m/d/Y h:i:sa");
	$errorData .= "|".$errorMsg;
	$errorData .= "|".post_data();
	if (isset($_SERVER['REMOTE_ADDR'])) {
		$errorData .= "|RA:".$_SERVER['REMOTE_ADDR'];
	}
	if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$errorData .= "|HXFF:".$_SERVER['HTTP_X_FORWARDED_FOR'];
	}
	if (isset($_SERVER['HTTP_CLIENT_IP'])) {
		$errorData .= "|HCI:".$_SERVER['HTTP_CLIENT_IP'];
	}
	$errorData .= "|".$_SERVER['HTTP_USER_AGENT'];
	file_put_contents($errorsFile, $errorData."\n", FILE_APPEND);
	die($errorMsg);
}


/*
** Allows for a default setting to be used if the provided variable $v isn't set.
** @param 	$v 			Value to test using isset().
** @param 	$def 		Value to use if isset($v) returns false.
** @return 				Either $v or $def if $v is not set.
*/
function default_val($v, $def) {
	if (isset($v))
		return $v;
	else
		return $def;
}


/*
** Sets a value in the Google Forms and Email Template map based on a given data source type and source key.
** Examples of source types include post, customerRow, and itemRow.
*/
function set_gf_val_by_source_key($source_type, $source_key, $val, $def="") {
	global $gfFormMap;
	foreach($gfFormMap as $gfFieldName => $gfValuesArray) {
		if (array_key_exists($source_type, $gfValuesArray)) {
			if($gfValuesArray[$source_type] == $source_key) {
				$gfFormMap[$gfFieldName]["value"] = default_val($val, $def);
				return true;
			}
		}
	}
	return false;
}


/*
** Sets a series of values based on their source type in the Google forms and Email Template map.
** An example would be setting all post sources by calling set_array_vals_from_source($gfFormMap, "post", $_POST).
*/

function set_array_vals_from_source(&$target_array, $source_type, $source_array) {
	foreach($target_array as $gfFieldName => $gfValuesArray) {
		if (array_key_exists($source_type, $gfValuesArray)) {
			foreach($source_array as $sourceKey => $sourceVal) {
				if ($sourceKey == $gfValuesArray[$source_type]) {
					$target_array[$gfFieldName]["value"] = default_val($sourceVal, "");
				}
			}
		}
	}
	foreach($target_array as $gfFieldName => $gfValuesArray) {
		if (array_key_exists($source_type, $target_array[$gfFieldName])) {
			if (!array_key_exists("value", $target_array[$gfFieldName])) {
				$target_array[$gfFieldName]["value"] = "";
			}
		}
	}
}



/*
** Verify required $_POST/$_COOKIE parameters and begin populating post parameters into $gfFormMap.
*/
foreach($requiredParams as $requiredParam) {
	if (!isset($_POST[$requiredParam])) {
		die_error("ERROR 10010: missing params");
	}
}
foreach($requiredCookies as $requiredCookie) {
	if (!isset($_COOKIE[$requiredCookie])) {
		die_error("ERROR 10011: missing cookies");
	}
}
if(isset($_POST['e']) && $_POST['e'] == "No") {
	$database =	$databaseProduction;
	$siteBaseURL = $c8ProductionBase;
	set_gf_val_by_source_key("post", "e", "No");
} else {
	$database =	$databasePreview;
	$siteBaseURL = $c8PreviewBase;
	set_gf_val_by_source_key("post", "e", "Yes");
}

/*
** Snag Vendor ID.
*/
$vendorID = $_POST['vendorid'];

/*
** Load email template.
*/
$emailTemplate = file_get_contents($emailTemplateFile)
	or die_error("ERROR 10022: missing email template file");


/*
** Open database connection and confirm email with clientid.
** Fetch the user's first, middle, and last name.
** Fetch the site's name.
*/
$dbConnection = mysql_connect($serverIP, $userID, $password, true)
	or die_error("ERROR 10030: unable to connect to server");
$db = mysql_select_db($database,$dbConnection)
	or die_error("ERROR 10040: unable to select database:".$database);

$escapedClientID = 		mysql_real_escape_string($_POST['ci']);
$escapedVendorID =      mysql_real_escape_string($_POST['vendorid']);
$queryCustomer = 		"SELECT email, firstname, lastname, middlename, vendorid FROM customer WHERE clientid='".$escapedClientID."';";
$querySitePreferences = "SELECT vendorid, sitename FROM preferences WHERE vendorid='".$escapedVendorID."';";

// Query for customer record.
$sqlResult = mysql_query($queryCustomer)
	or die_error("ERROR 10050: Unable to execute query; [ ".$queryCustomer." ]");
$rowCount = mysql_affected_rows();
if ($rowCount != 1) {
	die_error("ERROR 10060: multiple or no matching rows of given criteria");
}
$rowCustomer = mysql_fetch_object($sqlResult);
if (strtolower($_POST["email"]) != strtolower($rowCustomer->email)) {
	die_error("ERROR 10070: mismatched email records");
}
if ($rowCustomer->vendorid != $_POST['vendorid']) {
	die_error("ERROR 10071: vendorid mistmatch between customer and form");
}
mysql_free_result($sqlResult);

// Query for site record.
$sqlResult2 = mysql_query($querySitePreferences)
	or die_error("ERROR 10072: Unable to execute query; [".$querySitePreferences."]");
$rowCount = mysql_affected_rows();
if ($rowCount != 1) {
	die_error("ERROR 10073: multiple or no matching rows of given criteria");
}
$rowSitePreferences = mysql_fetch_object($sqlResult2);
$subject = str_replace("{{{sitename}}}", $rowSitePreferences->sitename, $subject);

mysql_free_result($sqlResult2);


/*
** Validation passed. Construct Google Forms data and POST.
*/
set_array_vals_from_source($gfFormMap, "post", $_POST);
set_array_vals_from_source($gfFormMap, "customerRow", $rowCustomer);
$googleFields = array();
foreach($gfFormMap as $gfKey => $gfValuesArray) {
	$googleFields[$gfKey] = $gfValuesArray["value"];
}

// URL-ify the data for the POST.
foreach($googleFields as $key=>$value) {
	$fields_string .= $key.'='.$value.'&';
}
rtrim($fields_string, '&');

// Open connection.
$ch = curl_init();

// Set the URL, number of POST vars, POST data, and prevent output.
curl_setopt($ch, CURLOPT_URL,				$gfURL);
curl_setopt($ch, CURLOPT_POST,				count($googleFields));
curl_setopt($ch, CURLOPT_POSTFIELDS,		$fields_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,	true);

// Execute post.
$result = curl_exec($ch);

// Close connection.
curl_close($ch);


/*
** Build email and send.
*/
set_array_vals_from_source($emailTemplateMap, "post", $_POST);
set_array_vals_from_source($emailTemplateMap, "customerRow", $rowCustomer);
$emailBody = $emailTemplate;
foreach($emailTemplateMap as $templateKey => $templateValuesArray) {
	$emailBody = str_replace("{{{".$templateKey."}}}", $templateValuesArray["value"], $emailBody);
}
$emailBody = str_replace("{{{date}}}", date("m/d/Y h:ia"), $emailBody);


// Use the default sender on Amazon EMS as only can verified email send the mail
ini_set("sendmail_from", $emailFrom);
$headers = array();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-type: text/html; charset=iso-8859-1";
$headers[] = "From: ".$emailFrom;
if($bccEmailRecipients != '') {
	$headers[] = "Bcc: ".$bccEmailRecipients;
}
$headers[] = "X-Sender: ".$emailFrom."<".$emailFrom.">";
$headers[] = "X-Mailer: PHP ".phpversion();
$headers[] = "X-Priority: 3";

// Disperse email message.
$mailingAddress = '';
if(isset($_POST['e']) && $_POST['e'] == 'No') {
	if($emailTo == '') {
		$mailingAddress = $emailTemplateMap["email"]["value"];
	} else {
		$mailingAddress = $emailTo;
	}
} else {
	if($emailToPreview == '') {
		$mailingAddress = $emailTemplateMap["email"]["value"];
	} else {
		$mailingAddress = $emailToPreview;
	}
}
if(mail($mailingAddress, $subject, $emailBody, implode("\r\n",$headers) )) {
    
    echo 'OKAY';

    // Create a log entry.
    $logData  = date("m/d/Y h:i:sa");
    $logData .= "|".$emailTemplateMap["email"]["value"];
	$logData .= "|".post_data();
	if (isset($_SERVER['REMOTE_ADDR'])) {
		$logData .= "|RA:".$_SERVER['REMOTE_ADDR'];
	}
	if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$logData .= "|HXFF:".$_SERVER['HTTP_X_FORWARDED_FOR'];
	}
	if (isset($_SERVER['HTTP_CLIENT_IP'])) {
		$logData .= "|HCI:".$_SERVER['HTTP_CLIENT_IP'];
	}
	if (isset($_SERVER['HTTP_USER_AGENT'])) {
		$logData .= "|".$_SERVER['HTTP_USER_AGENT'];
	}

    file_put_contents($ordersFile, $logData, FILE_APPEND);

} else {
    die_error('ERROR 10200: mail failed');
}

?>