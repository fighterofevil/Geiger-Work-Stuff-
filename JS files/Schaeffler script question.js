    <script>
    	jQuery(document).ready( function() {
            
			var sqCostCenter = jQuery('div[id^=337]');
			var sqEmpID = jQuery('div[id^=345]');
			var sqRecCostCenter = jQuery('div[id^=340]');
			var sqRecEmpID = jQuery('div[id^=339]');
			var sqRecEmpFName = jQuery('div[id^=343]');
			var sqRecEmpLName = jQuery('div[id^=344]');
			var sqCIPAward = jQuery("div[id^='338']");

			var hideAll = function() {
				//Hide all by default. (Not CIPAwards)
				sqCostCenter.hide();
				sqEmpID.hide();
				sqRecCostCenter.hide();
				sqRecEmpID.hide();
				sqRecEmpFName.hide();
				sqRecEmpLName.hide();
			};

			sqCIPAward.hide();

			hideAll();

			if(first_tab_id =='NCC-ACCOUNT'){ //If this is an invoice order

				if($('body').hasClass('cipBuyer')){
					sqCIPAward.show();
				}
    			
    			$("select[name='338+0']").bind('change', function() {
    			
					hideAll();

                    if($('body').hasClass('cipBuyer')){ //If the customer has the CIPBuyer Customer Property
    				
            			if($(this).val() == '4932') {
            				sqRecCostCenter.show();
            				sqRecEmpID.show();
        					sqRecEmpFName.show();
        					sqRecEmpLName.show();
        					
            			} else if ($(this).val() == '4933') {
        					sqCostCenter.show();
        					sqEmpID.show();
            			}
        		    }else{
        		        sqCostCenter.show();
        		        sqEmpID.show();
        		    }
        		}); 
            } else if (first_tab_id == 'PLP') {
                sqEmpID.show();
    		}

    		$("select[name='338+0']").trigger("change");

    	});
 
        function validateForm(){
            //var sqradio = jQuery('first_tab_id');
            var valid = true;
            var msg = "";
            var sqCostCenter = jQuery('input[name^=337]').val();
	        var sqEmpID = jQuery('input[name^=345]').val();
        	var sqRecCostCenter = jQuery('input[name^=340]').val();
        	var sqRecEmpID = jQuery('input[name^=339]').val();
        	var sqRecEmpFName = jQuery('input[name^=343]').val();
        	var sqRecEmpLName = jQuery('input[name^=344]').val();
        	var sqCIPAward = jQuery("select[name^='338+0']").val();
        	
        	if(first_tab_id =='NCC-ACCOUNT'){
        	   if ($('body').hasClass('cipBuyer')) { // Is a CIP Buyer 
        	        if(sqCIPAward == '4932'){
        	            if (sqRecEmpID.length < 2) {
					        valid=false;
				    	    msg += "Please enter the recipient's employee number \n";
				        }
				
				        if (sqRecCostCenter.length < 2) {
					        valid=false;
					        msg += "Please enter the recipient's cost center \n";
				        }
				
				        if (sqRecEmpFName.length < 2) {
				    	    valid=false;
					        msg += "Please enter the recipient's first name \n";
				        }
				        
				        if (sqRecEmpLName.length < 2) {
					        valid=false;
					        msg += "Please enter the recipient's last name";
				        }
				        
        	        }else if (sqCIPAward =='4933'){
        	            if (sqCostCenter.length < 2) {
        					valid=false;
        					msg += "Please enter your cost center \n";
				        }
				        
        				if (sqEmpID.length < 2) {
        					valid=false;
        					msg += "Please enter your employee number";
        				}
        				
        	        }else{ //Invalid (Neither "Yes or "No" chosen)
        	            
      		valid=false;
				msg += "Please choose an answer to the CIP award question";
			}
		} else { // Not a CIP Buyer
			if (sqCostCenter.length < 2) {
				valid=false;
				msg += "Please enter your cost center \n";
			}
			if (sqEmpID.length < 2) {
				valid=false;
				msg += "Please enter your employee number";
			}
		}	
	} else if (first_tab_id =='PLP') { // Not paying by Invoice
		if (sqEmpID.length < 2) {
			valid=false;
			msg += "Please enter your employee number";
		}
	}
	
	if (!valid) {
		alert(msg);
		return false;
		
	} else {
		return true;
		//doContinue('frm', 't', this,'review');

//		document.frm.submit();
	}
}
/* //Form Submit Validation */

        
    </script>