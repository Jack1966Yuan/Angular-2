 
/*******************************************************************************************
*        SP Compiled in SLIMqc, ESD_FIN_PRD02 Shashu Habtu 4/14/01
*        SP Compiled in SLIMqc, ESD_FIN_PRD02 Shashu Habtu 8/25/01
*******************************************************************************************/
CREATE PROCEDURE [dbo].[ap_bl_renew]
                      @batch_job_id int,
                      @return_msg varchar(255) OUTPUT
AS
 
/* --------------------------------------------------------------------------
* FILE NAME:          bl_renew.SQL               Version: 3.18                                                                                                        
* PROC NAME:          ap_bl_renew                                                                                                                      
*                                                                                                                                                                                                                
*                     FILE NAME                  PROC NAME                                                                                        
*                     ------------               -----------------                                                                       
*CALLS:               bl_renew.SQL    =          ap_bl_renew                                                   
*                                                                                                                                                                                                        
*WRITTEN BY: Eric Tanafon & Ray Hensley - 06/07/96 (started on!)                               
*            Huan Bui - 11/24/96                                                                                                                         
*DESC: This stored procedure will select valid business license renewal         
*      types and save to a output table to allow printing at afts.                        
*      Will also create obligations if first renewals                                                          
*                                                                                                                                                                                                       
*MODIFIED BY:         Date:            Description:                                                                                       
* RCH                 12/31/96         setup scanline total fee with no decimals               
* RCH                 01/16/97         Add procedure to get penalty amount for 2nd renewals
* RCH                 04/21/97         Add routine to call stored procedure that will
*                                       return the 'business id, location nbr and
*                                       district code as one line(@bus_loc_info).
* RCH                 04/23/97         Correct obl_type_code = 'BR' to obl_type_code = 'BL'.
* RCH                 09/30/97         Comment xp_cmdshell command line.  Now using a DOS
*                                       Batch process to initiate the 'BCP'.
* RCH                 11/12/97         Added facility to get any address associated with a
*                                       business when there is no main address or physical address
*                                       and add an obligation counter that will track all the
*                                       newly created obligations.
* EMT                 11/26/97         Emergency fix for address printing problem. Main branches
*                                       were printing mailing address in the space where physical
*                                       address should be. Also, correct code to commit every
*                                       1000 transactions.
* RCH      
          01/22/98         Corrected branch looping problem of two variable fields being
*                                       one char too small, @counter_dec dec(4,2) to dec(5,2) and
*                                       division dec(4,2) to dec(5,2).
* RCH                 11/05/98         Allow selection for reinstated branches,
*                                       business_status_id = 9 code 65.
* kchamberlain        3-29-2001        When inserting into work_table_branch chop main_trade_name to varchar(30)
*
* CJ                  10/02/2014       Added new columns to populate new UBI numbers and addressID in BL_RENEWAL_OUTPUT per case #4945
* CJ                  11/21/2014       case 5143 - getting business phone number
* -------------------------------------------------------------------------- */
 
set nocount on       
DECLARE
                @counting int, @test_count integer, @obl_count integer,
                @amount_owed money,
                @address_ln1 varchar(60), @address_ln2 varchar(60), @address_ln3 varchar(60),
                @addr_memo varchar(100),
                @bl_penalty_amount char(8), @bl_renewal_output_count integer,
                @bl_renew_date char(12), @br_fee money,
                @branch_count smallint, @branch_fee varchar(7), @branch_id char(8),
                @branch_nbr char(3),  @business_id int, @bus_loc_id integer,
                @business_legal_name char(50), @bus_phone_number char(12), 
                @bus_loc_info varchar(50),
                @bus_name_memo varchar(100),
                @bus_addr_1 char(45), @bus_addr_2 char(45), @bus_addr_3 char(45),
                @bus_addr_4 char(45), @bus_addr_5 char(45), @bus_addr_6 char(45),
                @bus_city_state_1 varchar(30), @bus_city_state_2 varchar(30),
                @bus_city_state_3 varchar(30), @bus_city_state_4 varchar(30),
                @bus_city_state_5 varchar(30), @bus_city_state_6 varchar(30),
                @bus_nme_1 varchar(30), @bus_nme_2 varchar(30), @bus_nme_3 varchar(30),
                @bus_nme_4 varchar(30), @bus_nme_5 varchar(30), @bus_nme_6 varchar(30),
                @cc char(1), @cty_st_zp_memo varchar(100),
                @current_cust_nbr integer,
                @counter int, @counter_dec dec(5,2), @division dec(5,2),
                @days_late integer, @dlis_branch_number char(3),
                @fee money, @fee_id integer,
                @insert_bl_renwal_table char(1),
                @input_string char(21),
                @license_id int, @license_units integer,
                @lic_description varchar(50),
                @lic_loc_cd_1 char(3), @lic_loc_cd_2 char(3), @lic_loc_cd_3 char(3),
                @lic_loc_cd_4 char(3), @lic_loc_cd_5 char(3), @lic_loc_cd_6 char(3),       
                @lic_type_renew_date smalldatetime, @lic_type_id integer, @license_type_id integer,       
                @lic_renew_fee money,
                @min_obl_id integer, @max_obl_id integer, @mod integer,
                @main_branch char(1),
                @mail_addr_1 char(41), @mail_addr_2 char(57), @mail_addr_3 char(57),
                @main_loc_fee varchar(7),
                @main_bus_loc_id int, @main_fee money, @main_trade_name varchar(50),
                @number_of_leading_zeros smallint,
                @obl_year_char char(4),
                @oblig_nbr_1 char(9), @oblig_nbr_2 char(9), @oblig_nbr_3 char(9),
                @oblig_nbr_4 char(9), @oblig_nbr_5 char(9), @oblig_nbr_6 char(9),
                @obl_id integer, @obl_due_date smalldatetime, @obl_source_id integer,
                @obl_type_id integer, @obl_year_int integer,
                @obl_branch_id integer, @original_amt integer,
                @open_flag char(1), @one_space char(1), @ocr_scan_line char(50),
                @padding_size smallint, @pen_amount_char varchar(7),
                @penalty_rate decimal(2), @penalty_amount mone
y, @penalty_min_amt money, @penalty_days_late integer,
                @phys_address_ln1 varchar(60), @phys_address_ln2 varchar(60),
                @phys_address_ln3 varchar(60), @phy_loc_memo varchar(100),
                @row_count integer,
                @renewal_date smalldatetime,
                @renewal_date_char char(12),
                @renewal_year_int integer,
                @renewal_year_char char(4),
                @return_code integer, @rtn_val integer,
                @run_version smallint,
                @scan_line_rca_code char(3), @scan_line_zeros char(16),
                @second_notice_line varchar(65),
                @sl_cust_nbr varchar(7), @sl_from_nbr char(7), @sl_to_nbr char(7),
                @sl_check_digit char(1), @sl_total_fee varchar(9),
                @tax_code char(1), @tax_period_cd_id integer,
                @total_fee varchar(9), @total_branch_count integer, @total_sl_fee integer,
                @trade_name varchar(50), @trade_nme char(32),
                @extra_spaces char(17),        
                @ubi_nbr char(11),
                @error_msg char(255)
 
/*case 4945*/
DECLARE         @ubi_9_1 char(9), @ubi_bus_id_1 char(3), @ubi_loc_id_1 char(4), @address_id_1 char(7), @bus_loc_id_1 char(7),
                @ubi_9_2 char(9), @ubi_bus_id_2 char(3), @ubi_loc_id_2 char(4), @address_id_2 char(7), @bus_loc_id_2 char(7),
                @ubi_9_3 char(9), @ubi_bus_id_3 char(3), @ubi_loc_id_3 char(4), @address_id_3 char(7), @bus_loc_id_3 char(7),
                @ubi_9_4 char(9), @ubi_bus_id_4 char(3), @ubi_loc_id_4 char(4), @address_id_4 char(7), @bus_loc_id_4 char(7),
                @ubi_9_5 char(9), @ubi_bus_id_5 char(3), @ubi_loc_id_5 char(4), @address_id_5 char(7), @bus_loc_id_5 char(7),
                @ubi_9_6 char(9), @ubi_bus_id_6 char(3), @ubi_loc_id_6 char(4), @address_id_6 char(7), @bus_loc_id_6 char(7)
 
SELECT @return_msg = NULL
 
SELECT @obl_year_char = obl_year,
       @run_version = run_version
  FROM batch_job
WHERE batch_job_id = @batch_job_id
 
if @obl_year_char IS NULL  or @run_version IS NULL
   BEGIN
      SELECT @return_msg = 'Null value is not allowed for obl year or run version '
      GOTO END_OF_ST
   END
 
/* Initialization */
SELECT @penalty_min_amt = 0
SELECT @obl_count = 0
/* SELECT @tax_code = 'Q' */
SELECT @one_space          = ' '
SELECT @extra_spaces       = '                |'
SELECT @scan_line_rca_code = '007'
SELECT @scan_line_zeros    = '0000000000000000'
SELECT @obl_year_int       = CONVERT(int, @obl_year_char)
 
/*
** 11/06/98 - Request from Cheryl Long concerning the renewal year being displayed.
** To make the renewal year correct, subtract one year from the obligation year
*/
SELECT @renewal_year_int  = @obl_year_int -1
 
SELECT @renewal_year_char = CONVERT(CHAR, @renewal_year_int)
 
SELECT @renewal_date_char = 'DEC 31, ' + @renewal_year_char
/* SELECT @renewal_date_char = 'DEC 31, ' + @obl_year_char */
 
SELECT @obl_source_id = obl_source_code_id 
  FROM obl_source_code 
 WHERE obl_source_code = 'LR'
   IF @@error != 0
      BEGIN
         SELECT @return_msg = 'Obligation Source Code BR missing '
         GOTO END_OF_ST
      END
 
SELECT @obl_type_id = obl_type_id
  FROM obl_type_code 
 WHERE obl_type_code = 'BL'
   IF @@error != 0
      BEGIN
         SELECT @return_msg = 'Obligation Type Code BR missing '
         GOTO END_OF_ST
      END
 
SELECT @lic_type_id = license_type_id
  FROM license_type 
 WHERE license_type_code = 'BL'
   IF @@error != 0
      BEGIN
         SELECT @return_msg = 'License Type Code BL missing '
         GOTO END_OF_ST
      END
 
SELECT @br_fee = bl_branch_fee
  FROM GLOBAL_TBL
WHERE global_id = 1
   IF @@error != 0
      BEGIN
         SELECT @return_msg = 'Branch fee missing from global table'
         GOTO END_OF_ST
      END
 
SELECT @license_type_id = @lic_type_id
 
SELECT @branch_fee = c
onvert(varchar(7), @br_fee)
 
EXECUTE @return_code = ap_get_fee_info
                                @obl_source_id = @obl_source_id,
                                @lic_type_id   = @lic_type_id,
                                @obl_type_id   = @obl_type_id,
                                @fee_type      = 'A',
                                @obl_year      = @obl_year_char,
                                @obl_period    = '00',
                                @fee_id        = @fee_id output,
                                @fee           = @fee output,
                                @due_date      = @obl_due_date output,
                                @error_msg     = @error_msg output
   If @return_code = -1
      BEGIN
         SELECT @return_msg = 'Failed to execute stored procedure ap_get_fee '
         GOTO END_OF_ST
      END
 
SELECT @main_loc_fee = convert(varchar(7), @fee)
 
SELECT @renewal_date = @obl_due_date
/* find business license penalty at 2nd notice time only */
IF @run_version = 2
   BEGIN
      EXECUTE @rtn_val = ap_get_license_penalty_amount
                            @license_type_id = @license_type_id,
                            @obl_year = @obl_year_char,
                            @days_late = 61,
                            @penalty_rate= @penalty_rate output,
                            @penalty_min_amt = @penalty_amount output,
                            @penalty_days_late = @penalty_days_late output
         IF @rtn_val < 2
            BEGIN
               SELECT @return_msg = 'Failed to execute the stored procedure ap_get_license_penalty_amount  '
               GOTO END_OF_ST
            END
   END
               
IF @run_version = 2
   SELECT @second_notice_line = '** 2ND NOTICE PLEASE DISREGARD NOTICE IF PAYMENT HAS BEEN MADE **'
ELSE
   SELECT @second_notice_line = '  '
               
IF @run_version = 2
   SELECT @penalty_min_amt = @penalty_amount
ELSE
   SELECT @penalty_min_amt = 0
 
/* Convert penalty amount from money to character format */
SELECT @bl_penalty_amount = convert(varchar(7), @penalty_min_amt)
 
TRUNCATE TABLE bl_renewal_output
/*TRUNCATE TABLE OBL_DELETE*/
 
If @@error <0 
   BEGIN
      SELECT @return_msg = 'Failed to truncate table BL_RENEW_OUTPUT '
      GOTO END_OF_ST
   END
 
/* Preset counters */
SELECT @test_count = 0
SELECT @counting = 0
 
DECLARE lic_crsr CURSOR FOR
        SELECT l.license_id,
               l.bus_loc_id,
               b.business_id,
               b.dlis_branch_number,
               b.trade_name,
               l.tax_period_cd_id
          FROM license l,
               business_location b
         WHERE l.license_type_id = 13
           AND (l.license_status_id NOT IN (2,3,4,5))
           AND l.renewal_date <= @renewal_date
           AND l.bus_loc_id = b.bus_loc_id
                 --and b.bus_loc_id=700427
           AND b.business_status_id NOT IN (6, 7, 8)
           AND b.main_branch_location = 'Y'
         ORDER BY b.business_id, b.main_branch_location DESC
 
/********* START MAIN PROCESS & INITIATE TRANSACTION  *********/
OPEN lic_crsr
FETCH lic_crsr INTO @license_id,
                    @bus_loc_id,
                    @business_id,
                    @dlis_branch_number,
                    @main_trade_name,
                    @tax_period_cd_id
IF @@fetch_status != 0
   BEGIN
      CLOSE lic_crsr
      DEALLOCATE lic_crsr
      SELECT @return_msg = 'No Data Found '
      GOTO END_OF_ST
   END
 
BEGIN TRAN
WHILE @@fetch_status = 0
   BEGIN /*start work in the loop*/
 
SELECT @counting = @counting + 1
 
--SELECT 'Line 271: Begin Loop: Record #' + Convert(varchar(18), @counting)
 
SELECT @tax_code = (SELECT l.tax_period_cd_desc
                      FROM TAX_PERIOD_CODE l
                     WHERE l.tax_period_cd_id = @tax_period_cd_id)
               
/* following code is used for testing purposes and  
        should be c
ommented out before running in production */
/***********************************************************
                SELECT @test_count = @test_count + 1
                if @test_count > 2000
                        BEGIN
                                GOTO END_OF_LOOP
                        END
************************************************************/
DELETE work_table_branch
 
/** Insert the main branch into the table first **/
INSERT INTO work_table_branch (bus_lic_id,  bus_loc_id,  bus_main_branch, bus_name,                               dlis_branch_number)
     VALUES                   (@license_id, @bus_loc_id, 'Y',             Convert(varchar(30), @main_trade_name), @dlis_branch_number)
 
/** Then insert the sub branch into it later **/
/*add/use new columns per case 4945*/
INSERT INTO work_table_branch (bus_lic_id,
                               bus_loc_id,
                               bus_main_branch,
                               bus_name,
                               dlis_branch_number)
     SELECT                    license_id,
                               license.bus_loc_id ,
                               'N',
                               Convert(varchar(30), trade_name),
                               dlis_branch_number
       FROM business_location, license
      WHERE business_id = @business_id
        AND main_branch_location = 'N'
        AND business_location.bus_loc_id = license.bus_loc_id
        AND business_location.business_status_id not in (6, 7, 8)
        AND license.license_type_id = 13
        AND license.license_status_id not in (2,3,4,5)
      ORDER BY business_location.dlis_branch_number
 
/*  11/05/98 Modified code from above.  allow reinstated branches.
** WHERE business_id = @business_id AND
**                                main_branch_location = 'N' AND
**                                business_location.bus_loc_id = license.bus_loc_id AND
**        -->                        business_location.business_status_id = 1 AND
**                                license.license_type_id = 13 AND
**        -->                        license.license_status_id = 1
**                        ORDER BY business_location.dlis_branch_number
*/
                /****************************************************************************
                 If we are creating obligations, need to check if the obligation for
                  this license and year already exists. If so, we won't create another one.
                ****************************************************************************/
                UPDATE work_table_branch
                   SET work_table_branch.obligation_id = obl.obligation_id,
                       work_table_branch.amount_charged = obl.original_amt,
                       work_table_branch.amount_paid = obl.paid_amt
                  FROM obligation obl
                 WHERE obl.license_id = work_table_branch.bus_lic_id
                   AND obl.obl_year = @obl_year_char
                   AND obl.obl_type_id = @obl_type_id
                   AND obl.obl_source_code_id = @obl_source_id       
                
                /*********************************************************************************
                        Delete sub branches that have already paid a branch fee.
                        If this is a first run then all of branches including main branch will have
                        zero amount paid. If this is a second run, maybe some of branches have already
                        paid a branch fee. We want to print on license renewal form those haven't paid yet.
                **********************************************************************************/
       
        DELETE work_table_branch WHERE amount_paid >= amount_charged and bus_main_branch = 'N'
        if @@error != 0
                BEGIN
                        ROLLBACK TRAN
 
                      CLOSE lic_crsr
                        DEALLOCATE lic_crsr       
                        SELECT @return_msg = 'Failed to delete rows from work_table_branch table'
                        GOTO END_OF_ST
                END
        SELECT @row_count = count(*) from work_table_branch
        /*********************************************************************************
                If there is only one row in the work_table_branch table, then it must be the main branch.
                if this main branch has paid a license renewal fee, then continue to process
                the next main branch.
        *********************************************************************************/
        if @row_count = 1
                BEGIN
                        SELECT @amount_owed = amount_paid - amount_charged from work_table_branch
                        if @amount_owed >= 0
                           GOTO FETCH_NEXT
                END
       
        /***************************************************************************
         We want the main branch to have a smallest obligation id among its sub
         branches' obligation ids.
        ****************************************************************************/
        SELECT @license_id = MIN(bus_lic_id)
          FROM work_table_branch
         WHERE processed = 'N'
           AND bus_main_branch = 'Y'
 
-- SELECT 'Line 368: Processing License #' + Convert(varchar(18), @license_id)
 
        WHILE @license_id > 0
                BEGIN
                        SELECT @main_branch = bus_main_branch,
                               @obl_id = obligation_id,
                               @bus_loc_id = bus_loc_id
                          FROM work_table_branch
                         WHERE bus_lic_id = @license_id
                        if @obl_id  IS NULL
                                BEGIN
                                          /*************************************************************
                                                 Create an obligation.
                                            Get next available obligation id.
                                          **************************************************************/
                                          EXECUTE @return_code = ap_get_next_id
                                                                  @table_name = 'OBLIGATION',
                                                                  @next_id = @obl_id output
 
                                          IF @return_code = -1
                                                  BEGIN
                                                                ROLLBACK TRAN
                                                                CLOSE lic_crsr
                                                                DEALLOCATE lic_crsr       
                                                                SELECT @return_msg = 'Failed to find next id for obligation table '
                                                                GOTO END_OF_ST
                                                END
                                        UPDATE work_table_branch
                                        SET obligation_id = @obl_id
                                        WHERE bus_lic_id = @license_id
                                        if @main_branch = 'Y'
                                                SELECT @lic_renew_fee = @fee
                                        else
                                                SELECT @lic_renew_fee = @br_fee
                                     INSERT INTO OBLIGATION 
                         ( obligation_id, fee_id, waive_code_id, obl_source_code_id,
                                                delq_excptn_cd_id, license_id, obl_type_id, bus_loc_id,
                            
                    original_obl_id, obl_year, obl_period, obl_due_date,
                                                date_created, original_amt, paid_amt, waived_amt,
                                                cancel_amt, adj_amt, balance_due, open_flag, delq_flag )
           
                                          VALUES (@obl_id, @fee_id, NULL, @obl_source_id, NULL,
                                                                @license_id, @obl_type_id, @bus_loc_id, NULL,
                                                                @obl_year_char, '00', @obl_due_date,
                                                                getdate(), @lic_renew_fee, 0,
                                                                0, 0, 0, @lic_renew_fee, 'Y', 'N')
                                        IF @@error != 0
                                                BEGIN
                                                        ROLLBACK TRAN
                                                        CLOSE lic_crsr
                                                        DEALLOCATE lic_crsr
                                                        SELECT @return_msg = 'Failed to insert obligation for license ' + convert(char(8), @license_id)
                                                        GOTO END_OF_ST
                                                END
                                        SELECT @obl_count = @obl_count + 1
                                        INSERT OBL_DELETE(obligation_id, obl_type, obl_year, obl_period )
                                        VALUES (@obl_id, 'BR', @obl_year_char, '00')
                                        /* VALUES (@obl_id, 'BR', '1997', '00') */
                                END
                        /********************************************************************
                                if this is a main branch then get its phone number and address
                        *********************************************************************/
                        IF @main_branch = 'Y'
                                BEGIN
                                        SELECT @business_legal_name = space(50),
                                               @ubi_nbr             = space(12),
                                               @bus_phone_number    = space(12)
 
                                        SELECT @bus_phone_number = PHONE_NUMBER.phone_number 
                                          FROM BUSINESS_PHONE_XREF,
                                               PHONE_NUMBER
                                         WHERE BUSINESS_PHONE_XREF.phone_nbr_id = PHONE_NUMBER.phone_nbr_id
                                           AND BUSINESS_PHONE_XREF.bus_loc_id   = @bus_loc_id
                                           AND PHONE_NUMBER.phone_type_id       = 3 --Business Phone
                                          
                                           if @bus_phone_number IS NULL OR DataLength(LTrim(RTrim(ISNULL(@bus_phone_number, '')))) < 1 --if there is no business phone, get cell phone
                                        /*case 5143*/
                                              BEGIN
                                              SELECT @bus_phone_number = PHONE_NUMBER.phone_number 
                                                FROM BUSINESS_PHONE_XREF,
                                                     PHONE_NUMBER
                                               WHERE BUSINESS_PHONE_XREF.phone_nbr_id = PHONE_NUMBER.phone_nbr_id
                                                 AND BUSINESS_PHONE_XREF.bus_loc_id   = @bus_loc_id
                                                 AND PHONE_NUMBER.phone_type_id       = 2 --Cell Phone
                                              END
                                           if @bus_phone_number IS NULL OR DataLength(L
Trim(RTrim(ISNULL(@bus_phone_number, '')))) < 1 --if there is no cell phone, get home phone
                                              BEGIN
                                              SELECT @bus_phone_number = PHONE_NUMBER.phone_number 
                                                FROM BUSINESS_PHONE_XREF,
                                                     PHONE_NUMBER
                                               WHERE BUSINESS_PHONE_XREF.phone_nbr_id = PHONE_NUMBER.phone_nbr_id
                                                 AND BUSINESS_PHONE_XREF.bus_loc_id   = @bus_loc_id
                                                 AND PHONE_NUMBER.phone_type_id       = 5 --Home Phone
                                              END
                                           if @bus_phone_number IS NULL OR DataLength(LTrim(RTrim(ISNULL(@bus_phone_number, '')))) < 1  --if there is no home phone, list blank
                                        /*end 5143*/
                                              BEGIN
                                                 SELECT @bus_phone_number = space(12)
                                              END
                                        if DataLength(LTrim(RTrim(@bus_phone_number))) > 0
                                                SELECT @bus_phone_number = Substring(@bus_phone_number, 1, 3) + '-' +
                                                                           Substring(@bus_phone_number, 4, 3) + '-' +
                                                                           Substring(@bus_phone_number, 7, 4)
                                                SELECT @business_legal_name = business_legal_name,
                                                       @ubi_nbr             = unified_business_id       
                                                  FROM business WHERE business_id = @business_id
                                            
                                             IF @ubi_nbr IS NULL
                                                SELECT @ubi_nbr = UBI_9
                                                  FROM BUSINESS_LOCATION
                                                 WHERE business_id = @business_id
                                                   AND main_branch_location = 'Y'
/* 
The code in this section that was there before the 11/26 change can be found
at the end of the file.
*/
                                END
/*
New code written 11/26. Find the branch physical address first, since this will be
needed in ALL cases. Since each branch has only one physical, request with a NULL
license type to reduce amount of code.
Then, for main branch ONLY, try to find the mailing
address for BL.
If no mailing address found, use the physical.
If no physical was found, rollback.
*/
                                EXECUTE @return_code = ap_get_loc_address
                                                              @bus_loc_id = @bus_loc_id,
                                                              @address_type_code = 'BP',
                                                              @lic_type_id = NULL,
                                                              @address_ln1 = @address_ln1 output,
                                                              @address_ln2 = @address_ln2 output,
                                                              @address_ln3 = @address_ln3 output
                                                 
                                IF @return_code = -1
                                        BEGIN
                                             ROLLBACK TRAN
                                             CLOSE lic_crsr
                                             DEALLOCATE lic_crsr
                                             SELECT @return_msg = 'Finding address failed for business id ' + convert(char(8), @business_id)
+ ' and location id ' + convert(char(8), @bus_loc_id)
                                             GOTO END_OF_ST
                                        END
                                IF @main_branch = 'Y'
                                        BEGIN
                                            EXECUTE @return_code = ap_get_loc_address
                                                                          @bus_loc_id = @bus_loc_id,
                                                                          @address_type_code = 'BL',
                                                                          @lic_type_id = @lic_type_id,
                                                                          @address_ln1 = @mail_addr_1 output,
                                                                          @address_ln2 = @mail_addr_2 output,
                                                                          @address_ln3 = @mail_addr_3 output
                                            IF @return_code = -1
                                                      SELECT @mail_addr_1 = @address_ln1,
                                                             @mail_addr_2 = @address_ln2,
                                                             @mail_addr_3 = @address_ln3
                                            ELSE
                                                BEGIN
                                                   IF @mail_addr_1  IS NULL or @mail_addr_1 = ' '
                                                        BEGIN
                                                            SELECT @mail_addr_1 = @mail_addr_2,
                                                                                  @mail_addr_2 = @mail_addr_3,
                                                                                 @mail_addr_3 = ' '
                                                        END
                                                END
                                        END
/*
We do NOT want the special mailing instructions on physical address here, since we
have only two address lines we can print. Therefore, put the 2nd line (street
address) in the 1st place, and city_state_zip (3rd line) in the second place.
*/
               
                                UPDATE work_table_branch
                                   SET bus_address_line1 = @address_ln2,
                                       bus_address_line2 = @address_ln3,
                                       bus_address_line3 = ''
                                 WHERE bus_lic_id = @license_id
                NEXT_BRANCH:
                       
                        UPDATE work_table_branch
                        SET processed = 'Y'
                        WHERE bus_lic_id = @license_id
                        SELECT @license_id = MIN(bus_lic_id)
                        FROM work_table_branch
                        WHERE processed = 'N'
       
                END
                        
        SELECT @min_obl_id = MIN(obligation_id),
               @max_obl_id = MAX(obligation_id)
          FROM work_table_branch
       
                SELECT @sl_from_nbr = convert(char(7), @min_obl_id),
               @sl_to_nbr = convert(char(7), @max_obl_id)
       
        SELECT @sl_cust_nbr = convert(varchar(7), @business_id)
        SELECT @number_of_leading_zeros = 7 - DATALENGTH(@sl_cust_nbr)
        WHILE @number_of_leading_zeros > 0
                BEGIN
                        SELECT @sl_cust_nbr = '0' + @sl_cust_nbr
                        SELECT @number_of_leading_zeros = @number_of_leading_zeros -1
                END
       
        SELECT @branch_count =  count(*) - 1 FROM work_table_branch
        /* start: 12/31/96 RCH setup scanline total fee with no decimals */
                /*SELECT @total_fee = @fee + (@branch_count * @br_fee)*/
        SELECT @tota
l_fee = convert(varchar(9), @fee + (@branch_count * @br_fee) + @penalty_min_amt)
        SELECT @total_fee = '$ ' + @total_fee
        SELECT @total_sl_fee = @fee + (@branch_count * @br_fee) + @penalty_min_amt
        SELECT @sl_total_fee = CONVERT(varchar(9), @total_sl_fee * 100)
        /* end  : 12/31/96 RCH setup scanline total fee with no decimals */
        SELECT @number_of_leading_zeros = 9 - DATALENGTH(@sl_total_fee)
        WHILE @number_of_leading_zeros > 0
                BEGIN
-- SELECT 'Line 551: sl_total_fee = ' + Convert(varchar(18), @sl_total_fee)
                        SELECT @sl_total_fee = '0' + @sl_total_fee
                        SELECT @number_of_leading_zeros = @number_of_leading_zeros -1
                END
        SELECT @input_string = @sl_cust_nbr + @sl_from_nbr + @sl_to_nbr
        EXECUTE @return_code = ap_barcode_check_digit @input_string = @input_string,
                                                      @check_digit = @sl_check_digit OUTPUT
        if @return_code < 0
                        BEGIN       
                                ROLLBACK TRAN
                                CLOSE lic_crsr
                                DEALLOCATE lic_crsr
                                SELECT @return_msg = 'Finding check digit failed for business id ' + convert(char(8), @business_id) + ' and location id ' + convert(char(8), @bus_loc_id)
                                GOTO END_OF_ST
                        END
        /***************************************************************************************
                After storing addresses into work_table_branch table for every branch, the next step
                will be looping through the table again row by row to get data and save them into
                BL_RENEWAL_OUTPUT table
        ***************************************************************************************/
       
        
        UPDATE work_table_branch
        SET processed = 'N'
        /*** Reset variables ***/
        SELECT
                @oblig_nbr_1 = ' ', @lic_loc_cd_1 = ' ', @bus_addr_1 = ' ',
                @bus_nme_1 = ' ', @bus_city_state_1 = ' ',
                @oblig_nbr_2 = ' ', @lic_loc_cd_2 = ' ', @bus_addr_2 = ' ',
                @bus_nme_2 = ' ', @bus_city_state_2 = ' ',
                @oblig_nbr_3 = ' ', @lic_loc_cd_3 = ' ', @bus_addr_3 = ' ',
                @bus_nme_3 = ' ', @bus_city_state_3 = ' ',
                @oblig_nbr_4 = ' ', @lic_loc_cd_4 = ' ', @bus_addr_4 = ' ',
                @bus_nme_4 = ' ', @bus_city_state_4 = ' ',
                @oblig_nbr_5 = ' ', @lic_loc_cd_5 = ' ', @bus_addr_5 = ' ',
                @bus_nme_5 = ' ', @bus_city_state_5 = ' ',
                @oblig_nbr_6 = ' ', @lic_loc_cd_6 = ' ', @bus_addr_6 = ' ',
                @bus_nme_6 = ' ', @bus_city_state_6 = ' '
 
         SELECT  --case 4945
                @ubi_9_1 = ' ', @ubi_bus_id_1 = ' ', @ubi_loc_id_1 = ' ', @address_id_1 = ' ', @bus_loc_id_1 = ' ',
                @ubi_9_2 = ' ', @ubi_bus_id_2 = ' ', @ubi_loc_id_2 = ' ', @address_id_2 = ' ', @bus_loc_id_2 = ' ',
                @ubi_9_3 = ' ', @ubi_bus_id_3 = ' ', @ubi_loc_id_3 = ' ', @address_id_3 = ' ', @bus_loc_id_3 = ' ',
                @ubi_9_4 = ' ', @ubi_bus_id_4 = ' ', @ubi_loc_id_4 = ' ', @address_id_4 = ' ', @bus_loc_id_4 = ' ',
                @ubi_9_5 = ' ', @ubi_bus_id_5 = ' ', @ubi_loc_id_5 = ' ', @address_id_5 = ' ', @bus_loc_id_5 = ' ',
                @ubi_9_6 = ' ', @ubi_bus_id_6 = ' ', @ubi_loc_id_6 = ' ', @address_id_6 = ' ', @bus_loc_id_6 = ' '
               
        SELECT @obl_id = obligation_id
          FROM work_table_branch
         WHERE processed = 'N'
           AND bus_main_branch = 'Y'
       
                /* go get the business id, location and district code line */
                EXECUTE ap_get_loc_info_for_address 
                                @bus_loc_id = @bus_loc_id,
          
                     @bus_loc_info = @bus_loc_info OUTPUT
                /*----------------------------------------------------------------------*
                 * WHILE @obl_id > 0 loop is setting up the output table rows           *
                 * Each row will hold up to 6 obligation entries with address           *
                 *----------------------------------------------------------------------*/
                /* 01/22/98 - corrected @counter_dec and @division field sizes */       
                SELECT @counter = 0
                WHILE @obl_id > 0
                        BEGIN
                                SELECT @counter = @counter + 1
                                SELECT @counter_dec = @counter
                                SELECT @division = Floor(@counter_dec / 6)
                                SELECT @mod = @counter - (@division * 6)
                                SELECT @insert_bl_renwal_table = 'N'
                               
         SELECT  --case 4945
                @ubi_9_1 = ' ', @ubi_bus_id_1 = ' ', @ubi_loc_id_1 = ' ', @address_id_1 = ' ', @bus_loc_id_1 = ' ',
                @ubi_9_2 = ' ', @ubi_bus_id_2 = ' ', @ubi_loc_id_2 = ' ', @address_id_2 = ' ', @bus_loc_id_2 = ' ',
                @ubi_9_3 = ' ', @ubi_bus_id_3 = ' ', @ubi_loc_id_3 = ' ', @address_id_3 = ' ', @bus_loc_id_3 = ' ',
                @ubi_9_4 = ' ', @ubi_bus_id_4 = ' ', @ubi_loc_id_4 = ' ', @address_id_4 = ' ', @bus_loc_id_4 = ' ',
                @ubi_9_5 = ' ', @ubi_bus_id_5 = ' ', @ubi_loc_id_5 = ' ', @address_id_5 = ' ', @bus_loc_id_5 = ' ',
                @ubi_9_6 = ' ', @ubi_bus_id_6 = ' ', @ubi_loc_id_6 = ' ', @address_id_6 = ' ', @bus_loc_id_6 = ' '
 
        /*        SELECT 'MOD 1', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 1
                                        SELECT @oblig_nbr_1 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_1 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_1 =  bus_address_line1,
                                                        @bus_nme_1 = bus_name,
                                                        @bus_city_state_1 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
                                                             @oblig_nbr_1,
                                                             @ubi_9_1      OUTPUT,
                                                             @ubi_bus_id_1 OUTPUT,
                                                             @ubi_loc_id_1 OUTPUT,
                                                             @address_id_1 OUTPUT,
                                                             @bus_loc_id_1 OUTPUT,
                                                             @return_msg   OUTPUT
 
        /*        SELECT 'MOD 2', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 2
                                        SELECT @oblig_nbr_2 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_2 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_2 =  bus_address_line1,
                                                        @bus_nme_2 = bus_name,
                                                        @bus_city_state_2 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
 
 
                                                             @oblig_nbr_2,
                                                             @ubi_9_2      OUTPUT,
                                                             @ubi_bus_id_2 OUTPUT,
                                                            @ubi_loc_id_2 OUTPUT,
                                                             @address_id_2 OUTPUT,
                                                             @bus_loc_id_2 OUTPUT,
                                                             @return_msg   OUTPUT
 
        /*        SELECT 'MOD 3', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 3
                                        SELECT @oblig_nbr_3 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_3 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_3 =  bus_address_line1,
                                                        @bus_nme_3 = bus_name,
                                                        @bus_city_state_3 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
                                                             @oblig_nbr_3,
                                                             @ubi_9_3      OUTPUT,
                                                             @ubi_bus_id_3 OUTPUT,
                                                             @ubi_loc_id_3 OUTPUT,
                                                             @address_id_3 OUTPUT,
                                                             @bus_loc_id_3 OUTPUT,
                                                             @return_msg   OUTPUT
 
        /*        SELECT 'MOD 4', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 4
                                        SELECT @oblig_nbr_4 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_4 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_4 =  bus_address_line1,
                                                        @bus_nme_4 = bus_name,
                                                        @bus_city_state_4 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
                                                             @oblig_nbr_4,
                                                             @ubi_9_4      OUTPUT,
                                                             @ubi_bus_id_4 OUTPUT,
                                                             @ubi_loc_id_4 OUTPUT,
                                                             @address_id_4 OUTPUT,
                                                             @bus_loc_id_4 OUTPUT,
                                                             @return_msg   OUTPUT
 
        /*        SELECT 'MOD 5', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 5
                                        SELECT @oblig_nbr_5 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_5 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_5 =  bus_address_line1,
                                                        @bus_nme_5 = bus_name,
              
                                          @bus_city_state_5 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
                                                             @oblig_nbr_5,
                                                             @ubi_9_5      OUTPUT,
                                                             @ubi_bus_id_5 OUTPUT,
                                                             @ubi_loc_id_5 OUTPUT,
                                                             @address_id_5 OUTPUT,
                                                             @bus_loc_id_5 OUTPUT,
                                                             @return_msg   OUTPUT
 
        /*        SELECT 'MOD 6', bus_address_line1, bus_address_line2 FROM work_table_branch WHERE bus_lic_id = @license_id */
                                if @mod = 0
                                       begin
                                                SELECT  @oblig_nbr_6 = convert(char(9), obligation_id),
                                                        @lic_loc_cd_6 = convert(char(4), dlis_branch_number),
                                                        @bus_addr_6 =  bus_address_line1,
                                                        @bus_nme_6 = bus_name,
                                                        @bus_city_state_6 = bus_address_line2
                                        FROM work_table_branch WHERE obligation_id = @obl_id
 
                                               EXECUTE dbo.prObligationGetUBI16    --case 4945
                                                             @oblig_nbr_6,
                                                             @ubi_9_6      OUTPUT,
                                                             @ubi_bus_id_6 OUTPUT,
                                                             @ubi_loc_id_6 OUTPUT,
                                                             @address_id_6 OUTPUT,
                                                             @bus_loc_id_6 OUTPUT,
                                                             @return_msg   OUTPUT
 
                                                SELECT @insert_bl_renwal_table = 'Y'
                                               
                                                
                                                INSERT INTO bl_renewal_output
                                                              (cc, bl_renew_date, bus_phone_nbr,
                                                               ubi_nbr,
                                                               cust_nbr,
                                                               main_loc_fee,
                                                               legal_nme,
                                                               trade_nme, branch_fee,
                                                               mail_addr_1, mail_addr_2, mail_addr_3,
                                                               total_fee,
                                                               oblig_nbr_1, lic_loc_cd_1, bus_addr_1, bus_nme_1, bus_city_state_1,
                                                               oblig_nbr_2, lic_loc_cd_2, bus_addr_2, bus_nme_2, bus_city_state_2,  
                                                               oblig_nbr_3, lic_loc_cd_3, bus_addr_3, bus_nme_3, bus_city_state_3,  
                                                               oblig_nbr_4, lic_loc_cd_4, bus_addr_4, bus_nme_4, bus_city_state_4,  
                                                               oblig_nbr_5, lic_loc_cd_5, bus_addr_5, bus_nme_5, bus_city_state_5,  
                                                              
 oblig_nbr_6, lic_loc_cd_6, bus_addr_6, bus_nme_6, bus_city_state_6,
                                                               scan_line_zeros,
                                                               sl_cust_nbr, sl_from_nbr, sl_to_nbr, sl_check_digit, sl_total_fee,
                                                               rca_code, branch_count,
                                                               tax_code,
                                                               second_notice_line,
                                                               bl_penalty_amount,
                                                               bus_loc_dist_info,
                                                               UBI_9_1,                                        --case 4945
                                                               UBI_bus_type_ID_1,                              --case 4945
                                                               UBI_bus_loc_ID_1,                               --case 4945
                                                               address_id_1,
                                                               bus_loc_id_1,
                                                               UBI_9_2,                                        --case 4945
                                                               UBI_bus_type_ID_2,                              --case 4945
                                                               UBI_bus_loc_ID_2,                               --case 4945
                                                               address_id_2,
                                                               bus_loc_id_2,
                                                               UBI_9_3,                                        --case 4945
                                                               UBI_bus_type_ID_3,                              --case 4945
                                                               UBI_bus_loc_ID_3,                               --case 4945
                                                               address_id_3,
                                                               bus_loc_id_3,
                                                               UBI_9_4,                                        --case 4945
                                                               UBI_bus_type_ID_4,                              --case 4945
                                                               UBI_bus_loc_ID_4,                               --case 4945
                                                               address_id_4,
                                                               bus_loc_id_4,
                                                               UBI_9_5,                                        --case 4945
                                                               UBI_bus_type_ID_5,                              --case 4945
                                                               UBI_bus_loc_ID_5,                               --case 4945
                                                               address_id_5,
                                                               bus_loc_id_5,
                                                               UBI_9_6,                                        --case 4945
                                                               UBI_bus_type_ID_6,                              --case 4945
                                                               UBI_bus_loc_ID_6,                               --case 4945
                                                               address_id_6,
                                                               bus_loc_id_6)                                   --case 4945
                                                 
                                     
             VALUES       ('1', @renewal_date_char + @one_space,
                                                                @bus_phone_number + @one_space,  
                                                                @ubi_nbr + @one_space,
                                                                @sl_cust_nbr + @one_space,  
                                                                @main_loc_fee + @one_space,
                                                                convert(char(32), @business_legal_name) + @one_space,  
                                                                convert(char(32), @main_trade_name) + @one_space, @branch_fee + @one_space,  
                                                                @mail_addr_1, @mail_addr_2, @mail_addr_3,
                                                                @total_fee + @one_space,  
                                                                @oblig_nbr_1 + @one_space, @lic_loc_cd_1 + @one_space, @bus_addr_1, @bus_nme_1, @bus_city_state_1,
                                                                @oblig_nbr_2 + @one_space, @lic_loc_cd_2 + @one_space, @bus_addr_2, @bus_nme_2, @bus_city_state_2,
                                                                @oblig_nbr_3 + @one_space, @lic_loc_cd_3 + @one_space, @bus_addr_3, @bus_nme_3, @bus_city_state_3,
                                                                @oblig_nbr_4 + @one_space, @lic_loc_cd_4 + @one_space, @bus_addr_4, @bus_nme_4, @bus_city_state_4,                               
                                                                @oblig_nbr_5 + @one_space, @lic_loc_cd_5 + @one_space, @bus_addr_5, @bus_nme_5, @bus_city_state_5,
                                                                @oblig_nbr_6 + @one_space, @lic_loc_cd_6 + @one_space, @bus_addr_6, @bus_nme_6, @bus_city_state_6 + @one_space,
                                                                @scan_line_zeros,
                                                                @sl_cust_nbr, @sl_from_nbr, @sl_to_nbr, @sl_check_digit, @sl_total_fee,
                                                                @scan_line_rca_code + @one_space, convert(char(3), @branch_count) + @one_space,
                                                                @tax_code,
                                                                @second_notice_line,
                                                                @bl_penalty_amount,
                                                                @bus_loc_info,
                                                                @ubi_9_1,                                        --case 4945
                                                                @ubi_bus_id_1,                                   --case 4945
                                                                @ubi_loc_id_1,                                   --case 4945
                                                                @address_id_1,
                                                                @bus_loc_id_1,
                                                                @ubi_9_2,                                        --case 4945
                                                                @ubi_bus_id_2,                                   --case 4945
                                                                @ubi_loc_id_2,                                   --case 4945
                                                                @address_id_2,
                                                                @bus_loc_id_2,
                                                                @ubi_9_3,                                        --case 4945
                                                                @ubi_bus_id_3,                                   --case 4945
                                    
                            @ubi_loc_id_3,                                   --case 4945
                                                                @address_id_3,
                                                                @bus_loc_id_3,
                                                                @ubi_9_4,                                        --case 4945
                                                                @ubi_bus_id_4,                                   --case 4945
                                                                @ubi_loc_id_4,                                   --case 4945
                                                                @address_id_4,
                                                                @bus_loc_id_4,
                                                                @ubi_9_5,                                        --case 4945
                                                                @ubi_bus_id_5,                                   --case 4945
                                                                @ubi_loc_id_5,                                   --case 4945
                                                                @address_id_5,
                                                                @bus_loc_id_5,
                                                                @ubi_9_6,                                        --case 4945
                                                                @ubi_bus_id_6,                                   --case 4945
                                                                @ubi_loc_id_6,                                   --case 4945
                                                                @address_id_6,
                                                                @bus_loc_id_6)                                   --case 4945
                                                        IF @@error != 0
                                                                BEGIN
                                                                   ROLLBACK TRAN
                                                                   CLOSE lic_crsr
                                                                   DEALLOCATE lic_crsr
                                                                   SELECT @return_msg = 'Inserting BL_RENEWAL_OUTPUT failed for obligation id ' + convert(char(8), @obl_id)
                                                                   GOTO END_OF_ST
                                                                END
                                                SELECT
                                                        @oblig_nbr_1 = ' ', @lic_loc_cd_1 = ' ', @bus_addr_1 = ' ',
                                                        @bus_nme_1 = ' ', @bus_city_state_1 = ' ',
                                                        @oblig_nbr_2 = ' ', @lic_loc_cd_2 = ' ', @bus_addr_2 = ' ',
                                                        @bus_nme_2 = ' ', @bus_city_state_2 = ' ',
                                                        @oblig_nbr_3 = ' ', @lic_loc_cd_3 = ' ', @bus_addr_3 = ' ',
                                                        @bus_nme_3 = ' ', @bus_city_state_3 = ' ',
                                                        @oblig_nbr_4 = ' ', @lic_loc_cd_4 = ' ', @bus_addr_4 = ' ',
                                                        @bus_nme_4 = ' ', @bus_city_state_4 = ' ',
                                                        @oblig_nbr_5 = ' ', @lic_loc_cd_5 = ' ', @bus_addr_5 = ' ',
                                                        @bus_nme_5 = ' ', @bus_city_state_5 = ' ',
                                                        @oblig_nbr_6 = ' ', @lic_loc_cd_6 = ' ', @bus_addr_6 = ' ',
                                                        @bus_nme_6 = ' ', @bus_city_state_6 = ' '
    
                                            SELECT  --case 4945
                                                        @ubi_9_1 = ' ', @ubi_bus_id_1 = ' ', @ubi_loc_id_1 = ' ', @address_id_1 = ' ', @bus_loc_id_1 = ' ',
                                                        @ubi_9_2 = ' ', @ubi_bus_id_2 = ' ', @ubi_loc_id_2 = ' ', @address_id_2 = ' ', @bus_loc_id_2 = ' ',
                                                        @ubi_9_3 = ' ', @ubi_bus_id_3 = ' ', @ubi_loc_id_3 = ' ', @address_id_3 = ' ', @bus_loc_id_3 = ' ',
                                                        @ubi_9_4 = ' ', @ubi_bus_id_4 = ' ', @ubi_loc_id_4 = ' ', @address_id_4 = ' ', @bus_loc_id_4 = ' ',
                                                        @ubi_9_5 = ' ', @ubi_bus_id_5 = ' ', @ubi_loc_id_5 = ' ', @address_id_5 = ' ', @bus_loc_id_5 = ' ',
                                                        @ubi_9_6 = ' ', @ubi_bus_id_6 = ' ', @ubi_loc_id_6 = ' ', @address_id_6 = ' ', @bus_loc_id_6 = ' '
                                        END
 
-- SELECT 'Line 748: End Loop: Record #' + Convert(varchar(18), @counting)
 
                                UPDATE work_table_branch
                                SET processed = 'Y'
                                WHERE obligation_id = @obl_id
                                SELECT @obl_id = MIN(obligation_id)
                                FROM work_table_branch
                                WHERE processed = 'N' and bus_main_branch = 'N'
                        END
                /*----------------------------------------------------------------------*
                 * end of output table rows loop                                        *
                 *----------------------------------------------------------------------*/
        if @insert_bl_renwal_table = 'N'               
                BEGIN
                                                INSERT INTO bl_renewal_output
                                                              (cc, bl_renew_date,
                                                                   bus_phone_nbr,
                                                                   ubi_nbr,
                                                                   cust_nbr,
                                                                   main_loc_fee,
                                                                   legal_nme,
                                                                   trade_nme,
                                                                   branch_fee,
                                                                   mail_addr_1, mail_addr_2, mail_addr_3,
                                                                   total_fee,
                                                                   oblig_nbr_1, lic_loc_cd_1, bus_addr_1, bus_nme_1, bus_city_state_1,  
                                                                   oblig_nbr_2, lic_loc_cd_2, bus_addr_2, bus_nme_2, bus_city_state_2,  
                                                                   oblig_nbr_3, lic_loc_cd_3, bus_addr_3, bus_nme_3, bus_city_state_3,  
                                                                   oblig_nbr_4, lic_loc_cd_4, bus_addr_4, bus_nme_4, bus_city_state_4,  
                                                                   oblig_nbr_5, lic_loc_cd_5, bus_addr_5, bus_nme_5, bus_city_state_5,  
                                                                   oblig_nbr_6, lic_loc_cd_6, bus_addr_6, bus_nme_6, bus_city_state_6,
                                                                   scan_line_zeros,
                                                                   sl_cust_nbr,
                                                                   sl_from_nbr,
                                                                   sl_to_nbr,
                                   
                                sl_check_digit,
                                                                   sl_total_fee,
                                                                   rca_code,
                                                                   branch_count,
                                                                   tax_code,
                                                                   second_notice_line,
                                                                   bl_penalty_amount,
                                                                   bus_loc_dist_info,
                                                                   UBI_9_1,                                        --case 4945
                                                                   UBI_bus_type_ID_1,                              --case 4945
                                                                   UBI_bus_loc_ID_1,                               --case 4945
                                                                   address_id_1,
                                                                   bus_loc_id_1,
                                                                   UBI_9_2,                                        --case 4945
                                                                   UBI_bus_type_ID_2,                              --case 4945
                                                                   UBI_bus_loc_ID_2,                               --case 4945
                                                                   address_id_2,
                                                                   bus_loc_id_2,
                                                                   UBI_9_3,                                        --case 4945
                                                                   UBI_bus_type_ID_3,                              --case 4945
                                                                   UBI_bus_loc_ID_3,                               --case 4945
                                                                   address_id_3,
                                                                   bus_loc_id_3,
                                                                   UBI_9_4,                                        --case 4945
                                                                   UBI_bus_type_ID_4,                              --case 4945
                                                                   UBI_bus_loc_ID_4,                               --case 4945
                                                                   address_id_4,
                                                                   bus_loc_id_4,
                                                                   UBI_9_5,                                        --case 4945
                                                                   UBI_bus_type_ID_5,                              --case 4945
                                                                   UBI_bus_loc_ID_5,                               --case 4945
                                                                   address_id_5,
                                                                   bus_loc_id_5,
                                                                   UBI_9_6,                                        --case 4945
                                                                   UBI_bus_type_ID_6,                              --case 4945
                                                                   UBI_bus_loc_ID_6,                               --case 4945
                                                                   address_id_6,
                                                                    bus_loc_id_6)                                   --case 4945
                               
                       VALUES ('1', @renewal_date_char + @one_space,
                                                                    @bus_phone_number + @one_space,  
                                                                    @ubi_nbr + @one_space,
                                                                    @sl_cust_nbr + @one_space,  
                                                                    @main_loc_fee + @one_space,
                                                                    convert(char(32), @business_legal_name) + @one_space,  
                                                                    convert(char(32), @main_trade_name) + @one_space,
                                                                    @branch_fee + @one_space,  
                                                                    @mail_addr_1, @mail_addr_2, @mail_addr_3,
                                                                    @total_fee + @one_space,  
                                                                    @oblig_nbr_1 + @one_space, @lic_loc_cd_1 + @one_space, @bus_addr_1, @bus_nme_1, @bus_city_state_1,
                                                                    @oblig_nbr_2 + @one_space, @lic_loc_cd_2 + @one_space, @bus_addr_2, @bus_nme_2, @bus_city_state_2,
                                                                    @oblig_nbr_3 + @one_space, @lic_loc_cd_3 + @one_space, @bus_addr_3, @bus_nme_3, @bus_city_state_3,
                                                                    @oblig_nbr_4 + @one_space, @lic_loc_cd_4 + @one_space, @bus_addr_4, @bus_nme_4, @bus_city_state_4,                               
                                                                    @oblig_nbr_5 + @one_space, @lic_loc_cd_5 + @one_space, @bus_addr_5, @bus_nme_5, @bus_city_state_5,
                                                                    @oblig_nbr_6 + @one_space, @lic_loc_cd_6 + @one_space, @bus_addr_6, @bus_nme_6, @bus_city_state_6 + @one_space,
                                                                    @scan_line_zeros,
                                                                    @sl_cust_nbr,
                                                                    @sl_from_nbr,
                                                                    @sl_to_nbr,
                                                                    @sl_check_digit,
                                                                    @sl_total_fee,
                                                                    @scan_line_rca_code + @one_space,  
                                                                    convert(char(3), @branch_count)  + @one_space,
                                                                    @tax_code,
                                                                    @second_notice_line,
                                                                    @bl_penalty_amount,
                                                                    @bus_loc_info,
                                                                    @ubi_9_1,                                        --case 4945
                                                                    @ubi_bus_id_1,                                   --case 4945
                                                                    @ubi_loc_id_1,                                   --case 4945
                                                                    @address_id_1,
                                                                    @bus_loc_id_1,
                                                                    @ubi_9_2,                                        --case 4945
                                                                    @ubi_bus_id_2,                                   --case 4945
                                 
                                  @ubi_loc_id_2,                                   --case 4945
                                                                    @address_id_2,
                                                                    @bus_loc_id_2,
                                                                    @ubi_9_3,                                        --case 4945
                                                                    @ubi_bus_id_3,                                   --case 4945
                                                                    @ubi_loc_id_3,                                   --case 4945
                                                                    @address_id_3,
                                                                    @bus_loc_id_3,
                                                                    @ubi_9_4,                                        --case 4945
                                                                    @ubi_bus_id_4,                                   --case 4945
                                                                    @ubi_loc_id_4,                                   --case 4945
                                                                    @address_id_4,
                                                                    @bus_loc_id_4,
                                                                    @ubi_9_5,                                        --case 4945
                                                                    @ubi_bus_id_5,                                   --case 4945
                                                                    @ubi_loc_id_5,                                   --case 4945
                                                                    @address_id_5,
                                                                    @bus_loc_id_5,
                                                                    @ubi_9_6,                                        --case 4945
                                                                    @ubi_bus_id_6,                                   --case 4945
                                                                    @ubi_loc_id_6,                                   --case 4945
                                                                    @address_id_6,
                                                                    @bus_loc_id_6)                                   --case 4945
                                                IF @@error != 0
                                                        BEGIN
                                                                ROLLBACK TRAN
                                                                CLOSE lic_crsr
                                                                DEALLOCATE lic_crsr
                                                                SELECT @return_msg = 'Inserting BL_RENEWAL_OUTPUT failed for obligation ' + convert(char(8), @obl_id)                                                                         GOTO END_OF_ST
                                                                GOTO END_OF_ST
                                                        END
 
                END
 
 