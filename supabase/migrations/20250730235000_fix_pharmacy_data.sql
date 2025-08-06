-- Fix pharmacy data to use correct Canadian coordinates instead of San Francisco
-- This corrects the data mismatch between the app configuration (Canada) and sample data (US)

-- Clear existing pharmacy data
DELETE FROM public.pharmacies;

-- Insert corrected Canadian pharmacy data
INSERT INTO public.pharmacies (name, address, phone, website, latitude, longitude) VALUES
('Shoppers Drug Mart #1075', '100 King St W, Toronto, ON M5X 1C9', '(416) 977-1711', 'https://www.shoppersdrugmart.ca', 43.6481, -79.3817),
('Rexall Drug Store #8456', '1 Dundas St E, Toronto, ON M5B 2R8', '(416) 861-1211', 'https://www.rexall.ca', 43.6565, -79.3799),
('Metro Pharmacy', '277 Victoria St, Toronto, ON M5B 1W2', '(416) 977-0519', 'https://www.metro.ca', 43.6550, -79.3776),
('Costco Pharmacy', '629 The Queensway, Toronto, ON M8Y 1K9', '(416) 251-1234', 'https://www.costco.ca', 43.6261, -79.5012),
('Loblaws Pharmacy', '60 Carlton St, Toronto, ON M5B 1J2', '(416) 977-2856', 'https://www.loblaws.ca', 43.6611, -79.3776),
('Independent City Pharmacy', '348 College St, Toronto, ON M5T 3A2', '(416) 923-7359', null, 43.6577, -79.4003),
('UHN Toronto General Pharmacy', '200 Elizabeth St, Toronto, ON M5G 2C4', '(416) 340-4800', 'https://www.uhn.ca', 43.6591, -79.3890),
('Neighbourhood Pharmacy', '489 College St, Toronto, ON M6G 1A5', '(416) 923-1359', null, 43.6566, -79.4071),
('Pharmasave #427', '55 St Clair Ave W, Toronto, ON M4V 2Y7', '(416) 961-7243', 'https://www.pharmasave.com', 43.6869, -79.3953),
('Kensington Pharmacy', '131 Kensington Ave, Toronto, ON M5T 2K4', '(416) 593-9345', null, 43.6544, -79.4021),
('Yorkville Pharmacy', '118 Yorkville Ave, Toronto, ON M5R 1C2', '(416) 928-6300', null, 43.6711, -79.3944),
('The Beach Pharmacy', '2180 Queen St E, Toronto, ON M4E 1E6', '(416) 690-8866', null, 43.6670, -79.2975),
('North York Pharmacy', '5000 Yonge St, Toronto, ON M2N 7E9', '(416) 733-7321', null, 43.7615, -79.4111),
('Etobicoke Pharmacy', '1545 The Queensway, Toronto, ON M8Z 1T5', '(416) 255-8989', null, 43.6182, -79.5215),
('Scarborough Town Centre Pharmacy', '300 Borough Dr, Scarborough, ON M1P 4P5', '(416) 296-0296', null, 43.7764, -79.2574);