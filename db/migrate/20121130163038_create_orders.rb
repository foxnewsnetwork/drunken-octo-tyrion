class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
    	t.integer :company_id
    	t.integer :plant_id
    	t.string :carrier
    	t.string :external_id
    	t.text :notes
      t.timestamps
    end
    add_index :orders, :external_id
    add_index :orders, :company_id
    add_index :orders, :plant_id
  end
end
