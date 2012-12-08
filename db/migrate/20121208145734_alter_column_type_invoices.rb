class AlterColumnTypeInvoices < ActiveRecord::Migration
  def up
	change_column :invoices, :payable_type, :string  	
	change_column :invoices, :receivable_type, :string
  end

  def down
  	change_column :invoices, :payable_type, :integer  	
	change_column :invoices, :receivable_type, :integer
  end
end
