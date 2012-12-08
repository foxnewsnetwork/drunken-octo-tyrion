class CreateInvoices < ActiveRecord::Migration
  def change
    create_table :invoices do |t|
      t.string :genre
      t.text :notes
      t.string :pay_method
      t.decimal :amount, :precision => 12, :scale => 2
      t.integer :payable_id
      t.integer :payable_type
      t.integer :receivable_id
      t.integer :receivable_type
      t.string :status, :null => false, :default => "out"
      t.timestamps
    end
    add_index :invoices, [:payable_id, :payable_type], :name => "ion_pid_ptype"
    add_index :invoices, [:receivable_id, :receivable_type], :name => "ion_rid_rtype"
  end
end
