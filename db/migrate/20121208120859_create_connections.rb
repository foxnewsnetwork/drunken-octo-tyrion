class CreateConnections < ActiveRecord::Migration
  def change
    create_table :connections do |t|
      t.integer :invoice_id
      t.integer :order_id

      t.timestamps
    end
    add_index :connections, :invoice_id
    add_index :connections, :order_id
  end
end
