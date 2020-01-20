<?php



// Required to prevent complaints from PHP when using mail() function
date_default_timezone_set("America/New_York");

    // $raw_post_body = file_get_contents("php://input");
    if(isset($_POST['refund'])){
     $obj = json_decode($_POST['refund']);

        if($obj->site == "US"){
             $youremail = 'cs@geiger.com';
             $subject = 'Bose Uniforms US Site: Refund Requested';
        } else {
             $youremail = 'bose@geigerbtc.com';
             $subject = 'Bose Uniforms BTC Site: Refund Requested';
        }

        // prepare email body
        $body = array();
        $body[] = "Customer Information:";
        $body[] = '';
        $body[] = "<b>Firstname:</b> $obj->firstname";
        $body[] = "<b>Lastname:</b> $obj->lastname";
        $body[] = "<b>Phone:</b> $obj->phone";
        $body[] = "<b>Email:</b> $obj->email";
        $body[] = '';
        $body[] = '';
        $body[] = "Refund or Exchange Requested for order: $obj->orderid";
        $body[] = '';
        $body[] = "Reason for refund: $obj->reason";
        $body[] = '';
        $body[] = "For the following items: <br/>";

        foreach($obj->items as $item) {
            $body[] = "<b>Item Name: </b>" .$item->name;
            $body[] = "<b>Item Code: </b>" . $item->code;
            $body[] = "<b>Attributes: </b>" . json_encode($item->attributes);
            $body[] = '';
            $body[] = '';
        }

        // Use the default sender on Amazon EMS
        ini_set("sendmail_from", "cs@geiger.com");
        $headers = array();
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-type: text/html; charset=iso-8859-1";
        $headers[] = "From: cs@geiger.com";
        $headers[] = "X-Sender: cs@geiger.com<cs@geiger.com>";
        $headers[] = "X-Mailer: PHP " . phpversion();
        $headers[] = "X-Priority: 3";

        // dispatch message

        if(mail($youremail, $subject, implode('<br/>',$body), implode("\r\n",$headers) )) {
            echo 'success';
        } else {
            echo 'send_fail';
        }

     //some php operation
    } else {
         echo 'fail';
    }
    
  
 
?>
